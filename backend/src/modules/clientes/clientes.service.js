import Cliente  from "./clientes.model.js";

export async function createCliente(data) {

    const cliente = await Cliente.create({
        nombre: data.nombre.trim(),
        rfc: data.rfc,
        direccion_fiscal: data.direccion_fiscal,
        estado: data.estado
    })
    return cliente;
}

export async function getAllClientes() {
    const clientes = await Cliente.findAll();
    return clientes;
}

export async function getClienteById(id) {
    const cliente = await Cliente.findByPk(id);


    return cliente;
}

export async function updateCliente(id, data) {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
        throw new Error("Cliente no encontrado");
    }
    
    await cliente.update({
        nombre: data.nombre.trim(),
        rfc: data.rfc,
        direccion_fiscal: data.direccion_fiscal,
        estado: data.estado
    });

    return cliente;
}

export async function deleteCliente(id) {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
        throw new Error("Cliente no encontrado");
    }
    
    await cliente.destroy();

    return;
}