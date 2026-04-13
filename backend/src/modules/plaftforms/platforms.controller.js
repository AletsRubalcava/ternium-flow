import { sequelize } from "../../config/database.js";
import {
    getAllPlatforms,
    getPlatformById,
    createPlatform,
    updatePlatform,
    deletePlatform
} from "./platforms.service.js";

import { createPlatformItem, deleteItemsByPlatform } from "../platform_items/platform_items.service.js";
import { createPlatformRequest } from "../platform_request/platform_request.service.js";
// ── Validar specs de tarima contra consignatario ──────────────────────────────
import consignees from "../consignatarios/consignatarios.model.js";
import platform_request from "../platform_request/platform_request.model.js";
import products from "../products/products.model.js";

export async function validateAgainstConsignee(platformData, items, id_consignee) {
    const consignee = await consignees.findByPk(id_consignee);
    if (!consignee) throw new Error("CONSIGNEE_NOT_FOUND");

    const violations = [];

    // Peso
    if (consignee.max_load != null && platformData.weight > Number(consignee.max_load)) {
        violations.push(`Peso (${platformData.weight} kg) excede la carga máxima (${consignee.max_load} kg).`);
    }
    if (consignee.min_load != null && platformData.weight < Number(consignee.min_load)) {
        violations.push(`Peso (${platformData.weight} kg) es menor a la carga mínima (${consignee.min_load} kg).`);
    }

    // Piezas
    if (consignee.max_pieces_number != null && platformData.number_of_pieces > Number(consignee.max_pieces_number)) {
        violations.push(`Número de piezas (${platformData.number_of_pieces}) excede el máximo (${consignee.max_pieces_number}).`);
    }

    // Dimensiones
    if (consignee.max_width != null && platformData.width > Number(consignee.max_width)) {
        violations.push(`Ancho (${platformData.width}) excede el máximo (${consignee.max_width}).`);
    }
    if (consignee.max_height != null && platformData.height > Number(consignee.max_height)) {
        violations.push(`Altura (${platformData.height}) excede el máximo (${consignee.max_height}).`);
    }

    // Diámetros por producto
    if (items?.length > 0 && 
        (consignee.max_internal_diameter != null || consignee.max_external_diameter != null)) {

        const productIds = items.map(i => i.id_product);
        const productList = await products.findAll({ where: { id: productIds } });

        let diameterViolation = false;
        for (const item of items) {
            const product = productList.find(p => p.id == item.id_product);
            if (!product) continue;

            if (consignee.max_internal_diameter != null &&
                Number(product.internal_diameter) > Number(consignee.max_internal_diameter)) {
                diameterViolation = true;
            }
            if (consignee.max_external_diameter != null &&
                Number(product.external_diameter) > Number(consignee.max_external_diameter)) {
                diameterViolation = true;
            }
        }
        if (diameterViolation) {
            violations.push("Uno o más productos exceden los diámetros máximos del consignatario.");
        }
    }

    return violations;
}

export async function getAllPlatformsHandler(req, res) {
    try {
        const platforms = await getAllPlatforms();
        res.status(200).json(platforms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function getPlatformByIdHandler(req, res) {
    const { id } = req.params;
    try {
        const platform = await getPlatformById(id);
        if (!platform) return res.status(404).json({ error: "PLATFORM_NOT_FOUND" });
        res.status(200).json(platform);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function createPlatformHandler(req, res) {
    const data = req.body;
    const { platform, items } = data;

    // Normalize
    const name        = platform.name?.trim();
    const description = platform.description?.trim();
    const type        = platform.type?.trim();

    // Validations: required fields
    if (!name || !type || platform.id_dispatch_packaging == null) {
        return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    // Type validations
    if (typeof name !== "string") {
        return res.status(400).json({ error: "INVALID_NAME_TYPE" });
    }
    if (description && typeof description !== "string") {
        return res.status(400).json({ error: "INVALID_DESCRIPTION_TYPE" });
    }
    if (typeof type !== "string") {
        return res.status(400).json({ error: "INVALID_TYPE_TYPE" });
    }

    // Numeric validations
    const numericFields = ["number_of_pieces", "weight", "width", "height"];
    for (const field of numericFields) {
        if (platform[field] != null && (typeof platform[field] !== "number" || platform[field] < 0)) {
            return res.status(400).json({
                error: "INVALID_NUMERIC_FIELD",
                field,
                message: `${field} debe ser un número mayor o igual a 0`
            });
        }
    }

    // Status normalization
    const status = platform.status != null ? !!platform.status : false;

    if (!Array.isArray(items)) {
        return res.status(400).json({ error: "INVALID_ITEMS_FORMAT" });
    }

    for (const item of items) {
        if (!item.id_product || typeof item.quantity !== "number" || item.quantity <= 0) {
            return res.status(400).json({ error: "INVALID_ITEM_DATA" });
        }
    }

    const request = data.request ?? null;
    const isPreset = type === "Preset";

    if (!isPreset && (!request || !request.id_consignee)) {
        return res.status(400).json({ error: "MISSING_REQUEST_FIELDS" });
    }

    try {
        const newPlatform = {
            name,
            description,
            type,
            status,
            id_dispatch_packaging: platform.id_dispatch_packaging,
            number_of_pieces:      platform.number_of_pieces ?? 0,
            weight:                platform.weight           ?? 0,
            width:                 platform.width            ?? 0,
            height:                platform.height           ?? 0,
            length:                platform.length           ?? 0,
        }

        const createdPlatform = await sequelize.transaction(async (t) => {

        // Solo validar contra consignatario si no es Preset
        if (!isPreset) {
            const violations = await validateAgainstConsignee(newPlatform, items, request.id_consignee);
            if (violations.length > 0) {
                const err = new Error("CONSIGNEE_SPEC_VIOLATION");
                err.violations = violations;
                throw err;
            }
        }

        const platformCreated = await createPlatform(newPlatform, t);

        for (const item of items) {
            await createPlatformItem({
                ...item,
                id_platform: platformCreated.id
            }, t);
            }

            // Solo crear request si no es Preset
        if (!isPreset) {
            await createPlatformRequest({
                id_platform:  platformCreated.id,
                id_consignee: request.id_consignee,
                comments:     request.comments ?? null
            }, t);
        }

        return platformCreated;
    });

        return res.status(201).json(createdPlatform);

    } catch (error) {
        console.error(error);

        if (error.message === "CONSIGNEE_SPEC_VIOLATION") {
            return res.status(422).json({ error: "CONSIGNEE_SPEC_VIOLATION", violations: error.violations });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ error: "VALIDATION_ERROR" });
        }
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ error: "DUPLICATE_ENTRY" });
        }

        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function updatePlatformHandler(req, res) {
    const { id } = req.params;
    const data = req.body;
    const { platform, items } = data;

    // Normalize
    const name        = platform.name?.trim();
    const description = platform.description?.trim();
    const type        = platform.type?.trim();

    // Validations: required fields
    if (!name || !type || platform.id_dispatch_packaging == null) {
        return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    // Type validations
    if (typeof name !== "string") {
        return res.status(400).json({ error: "INVALID_NAME_TYPE" });
    }
    if (description && typeof description !== "string") {
        return res.status(400).json({ error: "INVALID_DESCRIPTION_TYPE" });
    }
    if (typeof type !== "string") {
        return res.status(400).json({ error: "INVALID_TYPE_TYPE" });
    }

    // Numeric validations
    const numericFields = ["number_of_pieces", "weight", "width", "height"];
    for (const field of numericFields) {
        if (platform[field] != null && (typeof platform[field] !== "number" || platform[field] < 0)) {
            return res.status(400).json({
                error: "INVALID_NUMERIC_FIELD",
                field,
                message: `${field} debe ser un número mayor o igual a 0`
            });
        }
    }

    // Status normalization
    const status = platform.status != null ? !!platform.status : false;

    if (!Array.isArray(items)) {
        return res.status(400).json({ error: "INVALID_ITEMS_FORMAT" });
    }

    for (const item of items) {
        if (!item.id_product || typeof item.quantity !== "number" || item.quantity <= 0) {
            return res.status(400).json({ error: "INVALID_ITEM_DATA" });
        }
    }

    const existingRequest = await platform_request.findOne({ where: { id_platform: id } });
    const isPreset = type === "Preset";

    // Solo bloquear si no es preset y no hay request
    if (!isPreset && !existingRequest) {
        return res.status(404).json({ error: "PLATFORM_REQUEST_NOT_FOUND" });
    }

    try {
        const newPlatform = {
            name,
            description,
            type,
            status,
            id_dispatch_packaging: platform.id_dispatch_packaging,
            number_of_pieces:      platform.number_of_pieces ?? 0,
            weight:                platform.weight           ?? 0,
            width:                 platform.width            ?? 0,
            height:                platform.height           ?? 0,
            length:                platform.length           ?? 0,
        }

        await sequelize.transaction(async (t) => {
            // Solo validar contra consignatario si no es Preset
            if (!isPreset && existingRequest) {
                const violations = await validateAgainstConsignee(newPlatform, items, existingRequest.id_consignee);
                if (violations.length > 0) {
                    const err = new Error("CONSIGNEE_SPEC_VIOLATION");
                    err.violations = violations;
                    throw err;
                }
            }

            await updatePlatform(id, newPlatform, t);
            await deleteItemsByPlatform(id, t);

            for (const item of items) {
                await createPlatformItem({ ...item, id_platform: id }, t);
            }

            return res.status(200).json(newPlatform);
        });
    } catch (error) {
        console.error(error);

        if (error.message === "CONSIGNEE_SPEC_VIOLATION") {
            return res.status(422).json({ error: "CONSIGNEE_SPEC_VIOLATION", violations: error.violations });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ error: "VALIDATION_ERROR" });
        }
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ error: "DUPLICATE_ENTRY" });
        }

        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function deletePlatformHandler(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "MISSING_ID" });
    }

    try {
        await deletePlatform(id);
        return res.sendStatus(204);

    } catch (error) {
        if (error.code === "PLATFORM_NOT_FOUND") {
            return res.status(404).json({ error: "PLATFORM_NOT_FOUND" });
        }

        console.error(error);
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}