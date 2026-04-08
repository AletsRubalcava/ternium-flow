import { getDispatchById, getAllDispatches } from "./dispatch.service.js";

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