import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "./products.service.js";

export async function createProductHandler(req, res) {
    const data = req.body;

    // Normalize
    const name = data.name?.trim();
    const caliber = data.caliber?.trim();
    const part_number = data.part_number?.trim();
    const family = data.family?.trim();

    // Validations
    if (
        !name ||
        !part_number ||
        data.thickness == null ||
        data.length == null ||
        data.width == null ||
        data.unit_weight == null ||
        data.internal_diameter == null ||
        data.external_diameter == null
    ) {
        return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    // Type validations
    if (typeof name !== "string") {
        return res.status(400).json({ error: "INVALID_NAME_TYPE" });
    }
    if (caliber && typeof caliber !== "string") {
        return res.status(400).json({ error: "INVALID_CALIBER_TYPE" });
    }
    if (typeof part_number !== "string") {
        return res.status(400).json({ error: "INVALID_PART_NUMBER_TYPE" });
    }
    if (family && typeof family !== "string") {
        return res.status(400).json({ error: "INVALID_FAMILY_TYPE" });
    }
    // Numeric validations
    const numericFields = [
        "thickness",
        "length",
        "width",
        "unit_weight",
        "internal_diameter",
        "external_diameter"
    ];
    for (const field of numericFields) {
        if (typeof data[field] !== "number" || data[field] <= 0) {
            return res.status(400).json({
                error: "INVALID_NUMERIC_FIELD",
                field,
                message: `${field} debe ser un número mayor a 0`
            });
        }
    }

    if (data.internal_diameter >= data.external_diameter) {
        return res.status(400).json({
            error: "INVALID_NUMERIC_FIELS",
            message: "El diametro interno no puede ser igual o mayor al externo"
        });
    }

    // Status normalization
    const status = data.status != null ? !!data.status : false;

    try {
        const product = await createProduct({
            name,
            caliber,
            thickness: data.thickness,
            part_number,
            length: data.length,
            width: data.width,
            unit_weight: data.unit_weight,
            family,
            internal_diameter: data.internal_diameter,
            external_diameter: data.external_diameter,
            status
        });

        return res.status(201).json(product);

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

export async function getAllProductsHandler(req, res) {
    try {
        const productos = await getAllProducts();
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los productos" });
    }
}

export async function getProductByIdHandler(req, res) {
    const { id } = req.params;
    try {
        const producto = await getProductById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el producto" });
    }
}

export async function updateProductHandler(req, res) {
    const { id } = req.params;
    const data = req.body;

    // Normalize strings
    const name = data.name?.trim();
    const caliber = data.caliber != null ? data.caliber.trim() || null : null;
    const part_number = data.part_number?.trim();
    const family = data.family != null ? data.family.trim() || null : null; 

    // Validations: required fields
    if (
        !name ||
        !part_number ||
        data.thickness == null ||
        data.length == null ||
        data.width == null ||
        data.unit_weight == null ||
        data.internal_diameter == null ||
        data.external_diameter == null
    ) {
        return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    // Type validations
    if (typeof name !== "string") {
        return res.status(400).json({ error: "INVALID_NAME_TYPE" });
    }
    if (caliber && typeof caliber !== "string") {
        return res.status(400).json({ error: "INVALID_CALIBER_TYPE" });
    }
    if (typeof part_number !== "string") {
        return res.status(400).json({ error: "INVALID_PART_NUMBER_TYPE" });
    }
    if (family && typeof family !== "string") {
        return res.status(400).json({ error: "INVALID_FAMILY_TYPE" });
    }

    // Numeric validations
    const numericFields = [
        "thickness",
        "length",
        "width",
        "unit_weight",
        "internal_diameter",
        "external_diameter"
    ];
    for (const field of numericFields) {
        if (typeof data[field] !== "number" || data[field] <= 0) {
            return res.status(400).json({
                error: "INVALID_NUMERIC_FIELD",
                field,
                message: `${field} debe ser un número mayor a 0`
            });
        }
    }

    if (data.internal_diameter >= data.external_diameter) {
        return res.status(400).json({
            error: "INVALID_NUMERIC_FIELS",
            message: "El diametro interno no puede ser igual o mayor al externo"
        });
    }

    // Status normalization
    const status = data.status != null ? !!data.status : false;

    try {
        const updatedProduct = await updateProduct(id, {
            name,
            caliber,
            thickness: data.thickness,
            part_number,
            length: data.length,
            width: data.width,
            unit_weight: data.unit_weight,
            family,
            internal_diameter: data.internal_diameter,
            external_diameter: data.external_diameter,
            status
        });

        if (!updatedProduct) {
            return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
        }

        return res.status(200).json(updatedProduct);
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

export async function deleteProductHandler(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "MISSING_ID" });
    }

    try {
        await deleteProduct(id);

        return res.sendStatus(204);

    } catch (error) {
        if (error.code === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
        }

        console.error(error);

        return res.status(500).json({ 
            error: "INTERNAL_SERVER_ERROR" 
        });
    }
}