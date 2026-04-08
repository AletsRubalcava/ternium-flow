import customers  from "./clientes.model.js";

export async function createCustomer(data) {

    const customer = await customers.create({
        id_customer: data.id_customer.trim(),
        name: data.name.trim(),
        rfc: data.rfc,
        tax_address: data.tax_address,
        status: data.status,
    })
    return customer;
}

export async function getAllCustomers() {
    const customer = await customers.findAll();
    return customer;
}

export async function getCustomerById(id) {
    const customer = await customers.findByPk(id);
    return customer;
}

export async function updateCustomer(id, data) {
    const customer = await customers.findByPk(id);
    if (!customer) {
        throw new Error("Cliente no encontrado");
    }
    
    await customer.update({
        id_customer: data.id_customer.trim(),
        name: data.name.trim(),
        rfc: data.rfc,
        tax_address: data.tax_address,
        status: data.status,
        updated_at: new Date()
    });
    return customer;
}

export async function deleteCustomer(id) {
    const customer = await customers.findByPk(id);
    if (!customer) {
        throw new Error("Cliente no encontrado");
    }
    await customer.destroy();
    return;
}