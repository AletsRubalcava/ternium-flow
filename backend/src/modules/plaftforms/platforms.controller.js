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
        res.status(500).json({ message: "Error al obtener las tarimas" });
    }
}

export async function getPlatformByIdHandler(req, res) {
    const { id } = req.params;
    try {
        const platform = await getPlatformById(id);
        if (!platform) return res.status(404).json({ message: "Tarima no encontrada" });
        res.status(200).json(platform);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la tarima" });
    }
}

function validar(data, requireAll = true) {
    if (requireAll && (
        !data.id_consignee ||
        !data.name ||
        !data.dispatch_packaging
    )) {
        return "Missing required fields";
    }

    if (data.weight !== undefined && data.weight < 0)
        return "Weight cannot be negative";

    if (data.pieces_number !== undefined && data.pieces_number <= 0)
        return "Pieces number must be greater than 0";

    if (data.width  !== undefined && data.width  <= 0) return "Width must be greater than 0";
    if (data.height !== undefined && data.height <= 0) return "Height must be greater than 0";

    if (data.name    !== undefined && typeof data.name    !== "string") return "Name must be a string";
    if (data.description !== undefined && typeof data.description !== "string") return "Description must be a string";

    return null;
}

export async function createPlatformHandler(req, res) {
    const data = req.body;
    const error = validar(data, true);
    if (error) return res.status(400).json({ message: error });

    try {
        const platform = await createPlatform(data);
        res.status(201).json(platform);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear la tarima" });
    }
}

export async function updatePlatformHandler(req, res) {
    const { id } = req.params;
    const data = req.body;
    const error = validar(data, true);
    if (error) return res.status(400).json({ message: error });

    try {
        const platform = await updatePlatform(id, data);
        res.status(200).json(platform);
    } catch (error) {
        if (error.message === "Tarima no encontrada")
            return res.status(404).json({ message: error.message });
        console.error(error);
        res.status(500).json({ message: "Error al actualizar la tarima" });
    }
}

export async function deletePlatformHandler(req, res) {
    const { id } = req.params;
    try {
        const platform = await deletePlatform(id);
        res.status(200).json({ message: "Tarima eliminada", platform });
    } catch (error) {
        if (error.message === "Tarima no encontrada")
            return res.status(404).json({ message: error.message });
        console.error(error);
        res.status(500).json({ message: "Error al eliminar la tarima" });
    }
}