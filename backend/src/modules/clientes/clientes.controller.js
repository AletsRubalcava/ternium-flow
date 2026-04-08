import { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } from './clientes.service.js';

export async function createCustomerHandler(req, res) {
    const { id_customer, name, rfc, tax_address, status } = req.body;
    const errors = [];

    // Validations
    if (!id_customer?.trim()) errors.push("id");
    if (!name?.trim()) errors.push("name");
    if (typeof status !== "boolean") errors.push("status");

    // If errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            message: "Faltan campos o son inválidos",
            fields: errors
        });
    }

    try {
        const customer = await createCustomer({ id_customer, name, rfc, tax_address, status });
        res.status(201).json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el cliente" });
    }
}

export async function getAllCustomersHandler(req, res) {
    try {
        const customers = await getAllCustomers();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los clientes" });
        console.error(error);
    }
}

export async function getCustomerByIdHandler(req, res) {
    const { id } = req.params;

    try {
        const customer = await getCustomerById(id);
        if (!customer) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        } 
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el cliente" });
        console.error(error);
    }
}

export async function updateCustomerHandler(req, res) {
    const { id } = req.params;
    const { id_customer, name, rfc, tax_address, status } = req.body;
    const errors = [];

    // Validations
    if (!id_customer?.trim()) errors.push("id");
    if (!name?.trim()) errors.push("name");
    if (typeof status !== "boolean") errors.push("status");

    try {
        const customer = await updateCustomer(id, { id_customer, name, rfc, tax_address, status });
        res.status(200).json(customer);
    } catch (error) {
        if (error.message === "Cliente no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al actualizar el cliente" });
        console.error(error);
    }
}

export async function deleteCustomerHandler(req, res) {
    const { id } = req.params;
    
    try {
        await deleteCustomer(id);
        res.status(204).send();
    } catch (error) {
        if (error.message === "Cliente no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al eliminar el cliente" });
        console.error(error);
    }
}