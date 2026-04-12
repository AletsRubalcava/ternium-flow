import contacts from "./contacts.model.js";

export async function createContact(data) {

    const contact = await contacts.create({
        id_customer: data.id_customer,
        name: data.name,
        position: data.position,
        email: data.email,
        phone: data.phone,
        created_at: new Date(),
        updated_at: new Date()
    });
    return contact;
}

export async function getAllContacts() {
    const contact = await contacts.findAll();
    return contact;
}

export async function getContactById(id) {
    const contact = await contacts.findByPk(id);
    return contact;
}

export async function updateContact(id, data) {
    const contact = await contacts.findByPk(id);

    if (!contact) {
        error.code = "CONTACT_NOT_FOUND";
        throw error;
    }

    await contact.update({
        ...(data.id_customer !== undefined && { id_customer: data.id_customer }),
        ...(data.name        !== undefined && { name: data.name }),
        ...(data.position    !== undefined && { position: data.position }),
        ...(data.email       !== undefined && { email: data.email ?? null }),
        ...(data.phone       !== undefined && { phone: data.phone ?? null }),
        updated_at: new Date()
    });

    return contact;
}

export async function deleteContact(id) {
    const contact = await contacts.findByPk(id);

    if (!contact) {
        error.code = "CONTACT_NOT_FOUND";
        throw error;
    }

    await contact.destroy();
}