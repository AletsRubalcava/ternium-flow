import platforms from "./platforms.model.js";

export async function getAllPlatforms() {
    return await platforms.findAll();
}

export async function getPlatformById(id) {
    return await platforms.findByPk(id);
}

export async function createPlatform(data) {
    return await platforms.create({
        type:               data.type,
        name:               data.name,
        description:        data.description,
        status:             data.status ?? false,
        dispatch_packaging: data.dispatch_packaging,
        pieces_number:      data.pieces_number,
        weight:             data.weight,
        width:              data.width,
        height:             data.height,
        length:             data.length,
        created_at:         new Date(),
        updated_at:         new Date(),
    });
}

export async function updatePlatform(id, data) {
    const platform = await platforms.findByPk(id);
    if (!platform) throw new Error("Tarima no encontrada");
    console.log(platform)
    await platform.update({
        type:               data.type,
        name:               data.name,
        description:        data.description,
        status:             data.status,
        id_dispatch_packaging: data.id_dispatch_packaging,
        pieces_number:      data.number_of_pieces,
        weight:             data.weight,
        width:              data.width,
        length:             data.length,
        height:             data.height,
        updated_at:         new Date(),
    });

    return platform;
}

export async function deletePlatform(id) {
    const platform = await platforms.findByPk(id);
    if (!platform) throw new Error("Tarima no encontrada");

    await platform.destroy();
    return platform;
}