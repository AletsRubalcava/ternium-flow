import { createConsignee, getAllConsignatarios, getConsignatarioById, updateConsignee, deleteConsignee } from './consignatarios.service.js';

export async function createConsigneeHandler(req, res) {
    const data = req.body;
    
    // Validations
    if (
        !data.id_customer ||
        !data.name ||        
        !data.min_load ||
        !data.max_load ||
        !data.max_pieces_number ||
        !data.preferred_dispatch ||
        !data.max_internal_diameter ||
        !data.max_internal_diameter
    ) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Logical validations
    if (data.min_load > data.max_load) {
        return res.status(400).json({ message: "Minimum load cannot be greater than maximum load" });
    }

    if (data.max_internal_diameter >= data.max_external_diameter) {
        return res.status(400).json({ message: "Internal diameter cannot be greater than or equal to external diameter" });
    }

    if (data.max_pieces_number <= 0) {
        return res.status(400).json({ message: "Number of pieces per package must be greater than 0" });
    }

    if (data.max_width && data.max_width <= 0) {
        return res.status(400).json({ message: "Maximum width must be greater than 0" });
    }

    if (data.max_internal_diameter <= 0 || data.max_external_diameter <= 0) {
        return res.status(400).json({ message: "Diameters must be greater than 0" });
    }

    if (data.min_load <= 0 || data.max_load <= 0) {
        return res.status(400).json({ message: "Load weights must be greater than 0" });
    }

    // Type validations
    if (typeof data.name !== "string" || typeof data.address !== "string") {
        return res.status(400).json({ message: "Name and address must be strings" });
    }

    if (
        typeof data.min_load !== "number" ||
        typeof data.max_load !== "number" ||
        typeof data.max_pieces_number !== "number" ||
        (data.max_width !== undefined && typeof data.max_width !== "number") ||
        (data.max_height !== undefined && typeof data.max_height !== "number") ||
        (data.max_internal_diameter !== undefined && typeof data.max_internal_diameter !== "number") ||
        (data.max_external_diameter !== undefined && typeof data.max_external_diameter !== "number")
    ) {
        return res.status(400).json({ message: "Numeric fields must be numbers" });
    }

    try {
        const consignee = await createConsignee(data);
        res.status(201).json(consignee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating consignee" });
    }
}

export async function getAllConsignatariosHandler(req, res) {
    try {
        const consignatarios = await getAllConsignatarios();
        res.status(200).json(consignatarios);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los consignatarios" });
        console.error(error);
    }
}

export async function getConsignatarioByIdHandler(req, res) {
    const { id } = req.params;

    try {
        const consignatario = await getConsignatarioById(id);
        if (!consignatario) {
            return res.status(404).json({ message: "Consignatario no encontrado" });
        } 
        res.status(200).json(consignatario);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el consignatario" });
        console.error(error);
    }
}

export async function updateConsigneeHandler(req, res) {
    const { id } = req.params;
    const data = req.body;

    // Validations
    if (
        !data.id_customer ||
        !data.name ||
        !data.min_load ||
        !data.max_load ||
        !data.max_pieces_number ||
        !data.preferred_dispatch ||
        !data.max_internal_diameter ||
        !data.max_external_diameter
    ) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Logical validations
    if (data.min_load > data.max_load) {
        return res.status(400).json({ message: "Minimum load cannot be greater than maximum load" });
    }

    if (data.max_internal_diameter >= data.max_external_diameter) {
        return res.status(400).json({ message: "Internal diameter cannot be greater than or equal to external diameter" });
    }

    if (data.max_pieces_number <= 0) {
        return res.status(400).json({ message: "Number of pieces per package must be greater than 0" });
    }

    if (data.max_width && data.max_width <= 0) {
        return res.status(400).json({ message: "Maximum width must be greater than 0" });
    }

    if (data.max_internal_diameter <= 0 || data.max_external_diameter <= 0) {
        return res.status(400).json({ message: "Diameters must be greater than 0" });
    }

    if (data.min_load <= 0 || data.max_load <= 0) {
        return res.status(400).json({ message: "Load weights must be greater than 0" });
    }

    // Type validations
    if (typeof data.name !== "string" || typeof data.address !== "string") {
        return res.status(400).json({ message: "Name and address must be strings" });
    }

    if (
        typeof data.min_load !== "number" ||
        typeof data.max_load !== "number" ||
        typeof data.max_pieces_number !== "number" ||
        (data.max_width !== undefined && typeof data.max_width !== "number") ||
        (data.max_height !== undefined && typeof data.max_height !== "number") ||
        (data.max_internal_diameter !== undefined && typeof data.max_internal_diameter !== "number") ||
        (data.max_external_diameter !== undefined && typeof data.max_external_diameter !== "number")
    ) {
        return res.status(400).json({ message: "Numeric fields must be numbers" });
    }

    try {
        const consignee = await updateConsignee(id, data);
        res.status(200).json(consignee);
    } catch (error) {
        if (error.message === "Consignatario no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Error updating consignee" });
    }
}

export async function deleteConsigneeHandler(req, res) {
    const { id } = req.params;
    
    try {
        await deleteConsignee(id);
        res.status(204).send();
    } catch (error) {
        if (error.message === "Consignatario no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al eliminar el consignatario" });
        console.error(error);
    }
}