import platform_items from "./platform_items.model.js";

export async function createPlatformItem(data) {
    const item = await platform_items.create({
        id_platform: data.id_platform.trim(),
        id_product: data.id_product,
        quantity: data.quantity,
        created_at: new Date(),
        updated_at: new Date(),
    });
    return item;
}

export async function getAllPlatformItems() {
    const items = await platform_items.findAll();
    return items;
}

export async function getPlatformItemsById(id) {
    const item = await platform_items.findByPk(id);
    return item;
}

export async function updatePlatformItems(id, data) {
    const item = await platform_items.findByPk(id);
    
    if (!item) {
        const error = new Error("ITEM_NOT_FOUND");
        error.code = "ITEM_NOT_FOUND";
        throw error;
    }

    await platform_items.update(
        {
            id_platform: data.id_platform.trim(),
            id_product: data.id_product,
            quantity: data.quantity,
            updated_at: new Date(),
        },
    );

    return await platform_items.findByPk(id);
}

export async function deletePlatformItems(id) {
    const item = await platform_items.findByPk(id);

    if (!item) {
        error.code = "ITEM_NOT_FOUND";
        throw error;
    }

    await item.destroy();
}