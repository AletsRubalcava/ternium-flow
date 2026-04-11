import { createPlatformItem, getAllPlatformItems, getPlatformItemsById, updatePlatformItems, deletePlatformItems } from "./platform_items.service.js";

export async function createPlatformItemHandler(req, res) {
    const data = req.body;

    // Normalize
    const id_platform = data.id_platform?.trim();

    // Validations
    if (
        !id_platform ||
        data.id_product == null ||
        data.quantity == null
    ) {
        return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    // Type validations
    if (typeof id_platform !== "string") {
        return res.status(400).json({ error: "INVALID_ID_PLATFORM_TYPE" });
    }

    if (typeof data.id_product !== "number") {
        return res.status(400).json({ error: "INVALID_ID_PRODUCT_TYPE" });
    }

    if (typeof data.quantity !== "number" || data.quantity < 0) {
        return res.status(400).json({ error: "INVALID_QUANTITY" });
    }

    try {
        const item = await createPlatformItem({
            id_platform,
            id_product: data.id_product,
            quantity: data.quantity
        });

        return res.status(201).json(item);

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

export async function getAllPlatformItemsHandler(req, res) {
    try {
        const items = await getAllPlatformItems();
        return res.status(200).json(items);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function getPlatformItemByIdHandler(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "MISSING_ID" });
    }

    try {
        const item = await getPlatformItemsById(id);

        if (!item) {
            return res.status(404).json({ error: "ITEM_NOT_FOUND" });
        }

        return res.status(200).json(item);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function updatePlatformItemHandler(req, res) {
    const { id } = req.params;
    const data = req.body;

    // Normalize
    const id_platform = data.id_platform?.trim();

    // Validations
    if (
        !id ||
        !id_platform ||
        data.id_product == null ||
        data.quantity == null
    ) {
        return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    // Type validations
    if (typeof id_platform !== "string") {
        return res.status(400).json({ error: "INVALID_ID_PLATFORM_TYPE" });
    }

    if (typeof data.id_product !== "number") {
        return res.status(400).json({ error: "INVALID_ID_PRODUCT_TYPE" });
    }

    if (typeof data.quantity !== "number" || data.quantity < 0) {
        return res.status(400).json({
            error: "INVALID_QUANTITY",
            message: "quantity debe ser un número >= 0"
        });
    }

    try {
        const updatedItem = await updatePlatformItems(id, {
            id_platform,
            id_product: data.id_product,
            quantity: data.quantity
        });

        return res.status(200).json(updatedItem);

    } catch (error) {
        console.error(error);

        if (error.code === "ITEM_NOT_FOUND") {
            return res.status(404).json({ error: "ITEM_NOT_FOUND" });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ error: "VALIDATION_ERROR" });
        }

        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function deletePlatformItemHandler(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "MISSING_ID" });
    }

    try {
        await deletePlatformItems(id);

        return res.sendStatus(204);

    } catch (error) {
        if (error.code === "ITEM_NOT_FOUND") {
            return res.status(404).json({ error: "ITEM_NOT_FOUND" });
        }

        console.error(error);

        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}