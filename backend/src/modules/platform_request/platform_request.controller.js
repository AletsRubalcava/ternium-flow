import { getAllPlatformRequests } from "./platform_request.service.js";

export async function getAllPlatformsRequestsHandler(req, res) {
    try {
        const requests = await getAllPlatformRequests();
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las solicitudes" });
        console.error(error);
    }
}