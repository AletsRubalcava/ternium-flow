import {
    getAllPlatformRequests,
    updatePlatformRequest,
    createPlatformRequest,
    getPlatformRequestByID
} from "./platform_request.service.js";
import { sequelize } from "../../config/database.js";
import platforms from "../plaftforms/platforms.model.js";
import platform_items from "../platform_items/platform_items.model.js"
import {validateAgainstConsignee} from "../plaftforms/platforms.controller.js"

const status = {
    Approved: "Aceptada",
    Rejected: "Rechazada",
    Pending:  "Pendiente"
};

export async function getAllPlatformsRequestsHandler(req, res) {
    try {
        const requests = await getAllPlatformRequests();
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las solicitudes" });
    }
}

export async function getPlatformRequestByIDHandler(req, res) {
    const { id } = req.params;
    try {
        const request = await getPlatformRequestByID(id);
        if (!request) return res.status(404).json({ error: "PLATFORM_NOT_FOUND" });
        res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function acceptPlatformRequestHandler(req, res) {
    const { id } = req.params;
    try {
        await sequelize.transaction(async (t) => {
            await updatePlatformRequest(id, { status: status.Approved }, t);
        });
        res.status(200).json({ message: "PLATFORM_REQUEST_ACCEPTED" });
    } catch (error) {
        console.error(error);
        if (error.message === "PLATFORM_REQUEST_NOT_FOUND") {
            return res.status(404).json({ error: "PLATFORM_REQUEST_NOT_FOUND" });
        }
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function rejectPlatformRequestHandler(req, res) {
    const { id } = req.params;
    const { comments } = req.body;

    if (!comments?.trim()) {
        return res.status(400).json({ error: "COMMENTS_REQUIRED" });
    }

    try {
        await sequelize.transaction(async (t) => {
            await updatePlatformRequest(id, {
                status: status.Rejected,
                comments: comments.trim(),
            }, t);
        });

        res.status(200).json({ message: "PLATFORM_REQUEST_REJECTED" });

    } catch (error) {
        console.error(error);

        if (error.message === "PLATFORM_REQUEST_NOT_FOUND") {
            return res.status(404).json({ error: "PLATFORM_REQUEST_NOT_FOUND" });
        }

        if (error.message === "PLATFORM_NOT_FOUND") {
            return res.status(404).json({ error: "PLATFORM_NOT_FOUND" });
        }

        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function createPlatformRequestHandler(req, res) {
    const { id_platform, id_consignee, comments } = req.body;

    if (!id_platform || !id_consignee) {
        return res.status(400).json({ error: "id_platform and id_consignee are required" });
    }

    try {
        await sequelize.transaction(async (t) => {

            // ── Validar preset contra consignatario ──────────────────────
            const platform = await platforms.findByPk(id_platform);
            if (!platform) throw new Error("PLATFORM_NOT_FOUND");

            const platformItems = await platform_items.findAll({ where: { id_platform } });
            const itemsForValidation = platformItems.map(i => ({
                id_product: i.id_product,
                quantity:   i.quantity,
            }));

            const violations = await validateAgainstConsignee(platform, itemsForValidation, id_consignee);
            if (violations.length > 0) {
                const err = new Error("CONSIGNEE_SPEC_VIOLATION");
                err.violations = violations;
                throw err;
            }

            await createPlatformRequest({ id_platform, id_consignee, comments }, t);
        });

        res.status(201).json({ message: "PLATFORM_REQUEST_CREATED" });

    } catch (error) {
        if (error.message === "DUPLICATE_PLATFORM_REQUEST") {
            return res.status(409).json({ error: "DUPLICATE_PLATFORM_REQUEST" });
        }
        if (error.message === "CONSIGNEE_SPEC_VIOLATION") {
            return res.status(422).json({ error: "CONSIGNEE_SPEC_VIOLATION", violations: error.violations });
        }
        if (error.message === "PLATFORM_NOT_FOUND") {
            return res.status(404).json({ error: "PLATFORM_NOT_FOUND" });
        }
        console.error(error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}