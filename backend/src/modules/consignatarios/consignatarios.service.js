import consignees from "./consignatarios.model.js";
import Consignatario  from "./consignatarios.model.js";

export async function createConsignee(data) {

    const consignee = await consignees.create({
        id_customer: data.id_customer,
        preferred_dispatch: data.preferred_dispatch,
        name: data.name,
        address: data.address,
        min_load: data.min_load,
        max_load: data.max_load,
        max_pieces_number: data.max_pieces_number,
        max_width: data.max_width,
        max_length: data.max_length,
        max_internal_diameter: data.max_internal_diameter,
        max_external_diameter: data.max_external_diameter,
        additional_instructions: data.additional_instructions,
        status: data.status,
        created_at: new Date(),
        updated_at: new Date()
    });
    return consignee;
}

export async function getAllConsignatarios() {
    const consignees = await Consignatario.findAll();
    return consignees;
}

export async function getConsignatarioById(id) {
    const consignatario = await Consignatario.findByPk(id);
    return consignatario;
}

export async function updateConsignee(id, data) {
    const consignee = await consignees.findByPk(id);
    if (!consignee) {
        throw new Error("Consignatario no encontrado");
    }

    await consignee.update({
        id_customer: data.id_customer,
        preferred_dispatch: data.preferred_dispatch,
        name: data.name,
        address: data.address,
        min_load: data.min_load,
        max_load: data.max_load,
        max_pieces_number: data.max_pieces_number,
        max_width: data.max_width,
        max_length: data.max_length,
        max_internal_diameter: data.max_internal_diameter,
        max_external_diameter: data.max_external_diameter,
        additional_instructions: data.additional_instructions,
        status: data.status,
        updated_at: new Date()
    });

    return consignee;
}

export async function deleteConsignee(id) {
    const consignee = await consignees.findByPk(id);
    if (!consignee) {
        throw new Error("Consignatario no encontrado");
    }
    await consignee.destroy();
    return;
}