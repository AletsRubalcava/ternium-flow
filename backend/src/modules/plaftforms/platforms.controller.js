import {
    getAllPlatforms,
    getPlatformById,
    createPlatform,
    updatePlatform,
    deletePlatform
} from "./platforms.service.js";

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

    // Normalize
    const name        = data.name?.trim();
    const description = data.description?.trim();
    const type        = data.type?.trim();

    // Validations: required fields
    if (!name || !type || data.id_dispatch_packaging == null) {
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
        if (data[field] != null && (typeof data[field] !== "number" || data[field] < 0)) {
            return res.status(400).json({
                error: "INVALID_NUMERIC_FIELD",
                field,
                message: `${field} debe ser un número mayor o igual a 0`
            });
        }
    }

    // Status normalization
    const status = data.status != null ? !!data.status : false;

    try {
        const platform = await createPlatform({
            name,
            description,
            type,
            status,
            id_dispatch_packaging: data.id_dispatch_packaging,
            number_of_pieces:      data.number_of_pieces ?? 0,
            weight:                data.weight           ?? 0,
            width:                 data.width            ?? 0,
            height:                data.height           ?? 0,
        });

        return res.status(201).json(platform);

    } catch (error) {
        console.error(error);

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

    // Normalize
    const name        = data.name?.trim();
    const description = data.description?.trim();
    const type        = data.type?.trim();

    // Validations: required fields
    if (!name || !type || data.id_dispatch_packaging == null) {
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
        if (data[field] != null && (typeof data[field] !== "number" || data[field] < 0)) {
            return res.status(400).json({
                error: "INVALID_NUMERIC_FIELD",
                field,
                message: `${field} debe ser un número mayor o igual a 0`
            });
        }
    }

    // Status normalization
    const status = data.status != null ? !!data.status : false;
    console.log(data.id_dispatch_packaging)
    try {
        const updatedPlatform = await updatePlatform(id, {
            name,
            description,
            type,
            status,
            id_dispatch_packaging: data.id_dispatch_packaging,
            number_of_pieces:      data.number_of_pieces ?? 0,
            weight:                data.weight           ?? 0,
            width:                 data.width            ?? 0,
            height:                data.height           ?? 0,
            length:                data.length           ?? 0,
        });

        if (!updatedPlatform) {
            return res.status(404).json({ error: "PLATFORM_NOT_FOUND" });
        }

        return res.status(200).json(updatedPlatform);

    } catch (error) {
        console.error(error);

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