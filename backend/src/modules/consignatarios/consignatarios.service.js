import Consignatario  from "./consignatarios.model.js";

export async function createConsignatario(data) {

    const consignatario = await Consignatario.create({
        nombre: data.nombre.trim(),
        cliente_id: data.cliente_id,
        direccion: data.direccion,
        diametro_interno: data.diametro_interno,
        diametro_externo: data.diametro_externo,
        peso_minimo_despacho: data.peso_minimo_despacho,
        peso_maximo_despacho: data.peso_maximo_despacho,
        no_piezas_por_paquete: data.no_piezas_por_paquete,
        ancho_maximo_tarima: data.ancho_maximo_tarima,
        embalaje_despacho: data.embalaje_despacho
    })
    return consignatario;
}

export async function getAllConsignatarios() {
    const consignatarios = await Consignatario.findAll();
    return consignatarios;
}

export async function getConsignatarioById(id) {
    const consignatario = await Consignatario.findByPk(id);


    return consignatario;
}

export async function updateConsignatario(id, data) {
    const consignatario = await Consignatario.findByPk(id);
    if (!consignatario) {
        throw new Error("Consignatario no encontrado");
    }
    
    await consignatario.update({
        nombre: data.nombre.trim(),
        cliente_id: data.cliente_id,
        direccion: data.direccion,
        diametro_interno: data.diametro_interno,
        diametro_externo: data.diametro_externo,
        peso_minimo_despacho: data.peso_minimo_despacho,
        peso_maximo_despacho: data.peso_maximo_despacho,
        no_piezas_por_paquete: data.no_piezas_por_paquete,
        ancho_maximo_tarima: data.ancho_maximo_tarima,
        embalaje_despacho: data.embalaje_despacho
    });

    return consignatario;
}

export async function deleteConsignatario(id) {
    const consignatario = await Consignatario.findByPk(id);
    if (!consignatario) {
        throw new Error("Consignatario no encontrado");
    }
    
    await consignatario.destroy();

    return;
}