import platforms from "./platforms.model.js";

export async function getAllPlatforms() {
    return await platforms.findAll();
}

export async function getPlatformById(id) {
    return await platforms.findByPk(id);
}

export async function createPlatform(data, transaction) {
    return await platforms.create({
        type:                  data.type,
        name:                  data.name,
        description:           data.description,
        status:                data.status ?? false,
        id_dispatch_packaging: data.id_dispatch_packaging,
        number_of_pieces:         data.number_of_pieces,
        weight:                data.weight,
        width:                 data.width,
        height:                data.height,
        length:                data.length,
        created_at:            new Date(),
        updated_at:            new Date(),
    }, { transaction });
}

export async function updatePlatform(id, data, transaction) {
    const [updated] = await platforms.update(data, {
        where: { id },
        transaction
    });

    if (!updated) throw new Error("Tarima no encontrada");

    return await platforms.findByPk(id, { transaction });
}

export async function deletePlatform(id, transaction) {
    const platform = await platforms.findByPk(id);
    if (!platform) throw new Error("Tarima no encontrada");

    await platform.destroy({transaction}) ;
    return platform;
}