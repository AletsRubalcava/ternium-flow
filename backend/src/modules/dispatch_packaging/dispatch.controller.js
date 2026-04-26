import { getDispatchById, getAllDispatches, createDispatch, deleteDispatch } from "./dispatch.service.js";

export async function getAllDispatchesHandler(req, res) {
    try {
        const dispatches = await getAllDispatches();
        res.status(200).json(dispatches);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los embalajes de despacho" });
        console.error(error);
    }
}

export async function getDispatchByIdHandler(req, res) {
    const { id } = req.params;
    try {
        const dispatch = await getDispatchById(id);
        if (!dispatch) {
            return res.status(404).json({ message: "Embalaje de despacho no encontrado" });
        }
        res.status(200).json(dispatch);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el embalaje de despacho" });
        console.error(error);
    }
}

export async function createDispatchHandler(req, res) {
    const { name } = req.body;
    if (!name?.trim()) {
        return res.status(400).json({ message: "El nombre del embalaje es requerido" });
    }
    try {
        const dispatch = await createDispatch(name.trim());
        res.status(201).json(dispatch);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el embalaje" });
        console.error(error);
    }
}

export async function deleteDispatchHandler(req, res) {
    const { id } = req.params;
    try {
        const dispatch = await deleteDispatch(id);
        if (!dispatch) {
            return res.status(404).json({ message: "Embalaje no encontrado" });
        }
        res.status(200).json({ message: "Embalaje eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el embalaje" });
        console.error(error);
    }
}