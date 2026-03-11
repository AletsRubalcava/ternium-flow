import { createConsignatario } from './consignatarios.service.js';

export async function createConsignatarioHandler(req, res) {
    console.log(req.body);
    const data = req.body;


    //Safery checks
    if (!data.nombre || !data.diametro_interno || !data.diametro_externo || !data.peso_minimo_despacho || !data.peso_maximo_despacho || !data.no_piezas_por_paquete || !data.ancho_maximo_tarima || !data.embalaje_despacho) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    if (data.peso_minimo_despacho > data.peso_maximo_despacho) {
        return res.status(400).json({ message: "El peso mínimo de despacho no puede ser mayor al peso máximo de despacho" });
    }
    if (data.diametro_interno >= data.diametro_externo) {
        return res.status(400).json({ message: "El diámetro interno no puede ser mayor o igual al diámetro externo" });
    }
    if (data.no_piezas_por_paquete <= 0) {
        return res.status(400).json({ message: "El número de piezas por paquete debe ser mayor a 0" });
    }
    if (data.ancho_maximo_tarima <= 0) {
        return res.status(400).json({ message: "El ancho máximo de la tarima debe ser mayor a 0" });
    }
    if (data.diametro_interno <= 0 || data.diametro_externo <= 0) {
        return res.status(400).json({ message: "Los diámetros deben ser mayores a 0" });
    }
    if (data.peso_minimo_despacho <= 0 || data.peso_maximo_despacho <= 0) {
        return res.status(400).json({ message: "Los pesos de despacho deben ser mayores a 0" });
    }
    if (typeof data.nombre !== "string" || typeof data.embalaje_despacho !== "string") {
        return res.status(400).json({ message: "El nombre y el embalaje de despacho deben ser cadenas de texto" });
    }
    if (typeof data.diametro_interno !== "number" || typeof data.diametro_externo !== "number" || typeof data.peso_minimo_despacho !== "number" || typeof data.peso_maximo_despacho !== "number" || typeof data.no_piezas_por_paquete !== "number" || typeof data.ancho_maximo_tarima !== "number") {
        return res.status(400).json({ message: "Los campos de tipo numérico deben ser números" });
    }

    try {
        const consignatario = await createConsignatario(req.body);
        res.status(201).json(consignatario);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el consignatario" });
        console.error(error);
    }
}

