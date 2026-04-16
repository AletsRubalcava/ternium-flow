import products from "./products.model.js";

export async function createProduct(data) {
    const product = await products.create({
        name: data.name.trim(),
        caliber: data.caliber,
        thickness: data.thickness,
        part_number: data.part_number,
        length: data.length,
        width: data.width,
        unit_weight: data.unit_weight,
        family: data.family,
        internal_diameter: data.internal_diameter,
        external_diameter: data.external_diameter,
        status: data.status,
        created_at: new Date(),
        updated_at: new Date(),
    });
    return product;
}

export async function getAllProducts() {
    const product = await products.findAll();
    return product;
}

export async function getProductById(id) {
    const product = await products.findByPk(id);
    return product;
}

export async function updateProduct(id, data) {
    const product = await products.findByPk(id);
    
    if (!product) {
        const error = new Error("PRODUCT_NOT_FOUND");
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
    }

    await products.update(
        {
            name: data.name,
            caliber: data.caliber ?? null,
            thickness: data.thickness,
            part_number: data.part_number,
            length: data.length,
            width: data.width,
            unit_weight: data.unit_weight,
            family: data.family ?? null,
            internal_diameter: data.internal_diameter,
            external_diameter: data.external_diameter,
            status: data.status,
            updated_at: new Date(),
        },
        { 
            where: { id },
            returning: true  // para PostgreSQL
        }
    );

    return await products.findByPk(id);  // regresa el producto actualizado
}

export async function deleteProduct(id) {
    const product = await products.findByPk(id);

    if (!product) {
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
    }

    await product.destroy();
}