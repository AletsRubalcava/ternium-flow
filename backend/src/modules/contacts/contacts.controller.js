import { createContact, getAllContacts, getContactById, updateContact, deleteContact } from "./contacts.service.js";

export async function createContactHandler(req, res) {
    
    const data = req.body;

    // Normalize
    const name = data.name?.trim();
    const email = data.email?.trim();
    const phone = data.phone?.trim();

    // Validations
    if (!data.id_customer || !name || (!email && !phone)) {
        return res.status(400).json({ 
            error: "MISSING_REQUIRED_FIELDS"
        });
    }

    // Type validations
    if (typeof name !== "string") {
        return res.status(400).json({ 
            error: "INVALID_NAME_TYPE"
        });
    }

    if (email && typeof email !== "string") {
        return res.status(400).json({ 
            error: "INVALID_EMAIL_TYPE"
        });
    }

    if (phone && typeof phone !== "string") {
        return res.status(400).json({ 
            error: "INVALID_PHONE_TYPE"
        });
    }

    try {
        const contact = await createContact(data);
        return res.status(201).json(contact);

    } catch (error) {
        console.error(error);

        // Ejemplo: error de DB (constraint, etc.)
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ 
                error: "VALIDATION_ERROR"
            });
        }

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ 
                error: "DUPLICATE_ENTRY"
            });
        }

        return res.status(500).json({ 
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}

export async function getAllContactsHandler(req, res) {
    try {
        const contacts = await getAllContacts();
        return res.status(200).json(contacts);
    } catch (error) {
        console.error(error);

        return res.status(500).json({ 
            error: "INTERNAL_SERVER_ERROR" 
        });
    }
}

export async function getContactByIdHandler(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "MISSING_ID" });
    }

    try {
        const contact = await getContactById(id);
        if (!contact) {
            return res.status(404).json({ error: "CONTACT_NOT_FOUND" });
        }
        return res.status(200).json(contact);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            error: "INTERNAL_SERVER_ERROR" 
        });
    }
}

export async function updateContactHandler(req, res) {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
        return res.status(400).json({ error: "MISSING_ID" });
    }

    if (data.name && typeof data.name !== "string") {
        return res.status(400).json({ error: "INVALID_NAME_TYPE" });
    }

    if (data.email !== undefined && typeof data.email !== "string") {
        return res.status(400).json({ error: "INVALID_EMAIL_TYPE" });
    }

    if (data.phone && typeof data.phone !== "string") {
        return res.status(400).json({ error: "INVALID_PHONE_TYPE" });
    }

    const name = data.name?.trim() || null;
    const email = data.email?.trim() || null;
    const phone = data.phone?.trim() || null;

        if (
        data.email !== undefined &&
        data.phone !== undefined &&
        !email &&
        !phone
    ) {
        return res.status(400).json({
            error: "EMAIL_OR_PHONE_REQUIRED"
        });
    }

    try {
        const contact = await updateContact(id, {
            ...data,
            name,
            email,
            phone
        });

        return res.status(200).json(contact);

    } catch (error) {
        if (error.code === "CONTACT_NOT_FOUND") {
            return res.status(404).json({ error: "CONTACT_NOT_FOUND" });
        }

        console.error(error);

        return res.status(500).json({ 
            error: "INTERNAL_SERVER_ERROR" 
        });
    }
}

export async function deleteContactHandler(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "MISSING_ID" });
    }

    try {
        await deleteContact(id);

        return res.sendStatus(204);

    } catch (error) {
        if (error.code === "CONTACT_NOT_FOUND") {
            return res.status(404).json({ error: "CONTACT_NOT_FOUND" });
        }

        console.error(error);

        return res.status(500).json({ 
            error: "INTERNAL_SERVER_ERROR" 
        });
    }
}