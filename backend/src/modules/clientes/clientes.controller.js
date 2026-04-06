import { createCliente, getAllClientes, getClienteById, updateCliente, deleteCliente } from './clientes.service.js';

export async function createClienteHandler(req, res) {
    console.log(req.body);
    const data = req.body;


    //Safery checks
    if (!data.nombre || !data.rfc || !data.direccion_fiscal || !data.estado) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        const cliente = await createCliente(req.body);
        res.status(201).json(cliente);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el cliente" });
        console.error(error);
    }
}

export async function getAllClientesHandler(req, res) {
    try {
        const clientes = await getAllClientes();
        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los clientes" });
        console.error(error);
    }
}

export async function getClienteByIdHandler(req, res) {
    const { id } = req.params;

    try {
        const cliente = await getClienteById(id);
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        } 
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el cliente" });
        console.error(error);
    }
}

export async function updateClienteHandler(req, res) {
    const { id } = req.params;
    const data = req.body;

    //Safery checks
    if (!data.nombre || !data.rfc || !data.direccion_fiscal || !data.estado) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }


    try {
        const cliente = await updateCliente(id, data);
        res.status(200).json(cliente);

    } catch (error) {
        if (error.message === "Cliente no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al actualizar el cliente" });
        console.error(error);
    }
}

export async function deleteClienteHandler(req, res) {
    const { id } = req.params;
    
    try {
        await deleteCliente(id);
        res.status(204).send();
    } catch (error) {
        if (error.message === "Cliente no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al eliminar el cliente" });
        console.error(error);
    }
}