import platform_request from "./platform_request.model.js";
import { Op } from "sequelize";

const status = {
    Approved: "Aceptada",
    Rejected: "Rechazada",
    Pending:  "Pendiente"
};

export async function getAllPlatformRequests() {
    return await platform_request.findAll();
}

export async function getPlatformRequestByID(id) {
    return platform_request.findByPk(id);
}

export async function createPlatformRequest(data, transaction) {
    // Verificar si ya existe una request pendiente con la misma combinación
    const existing = await platform_request.findOne({
        where: {
            id_platform:  data.id_platform,
            id_consignee: data.id_consignee,
            status: {
                [Op.in]: [status.Pending, status.Approved],
            },
        },
        transaction,
    });

    if (existing) throw new Error("DUPLICATE_PLATFORM_REQUEST");

    return await platform_request.create({
        id_platform:  data.id_platform,
        id_consignee: data.id_consignee,
        status:       status.Pending,
        comments:     data.comments ?? null,
        created_at:   new Date(),
        updated_at:   new Date(),
    }, { transaction });
}

export async function updatePlatformRequest(id, data, transaction) {
    const request = await platform_request.findByPk(id);
    if (!request) throw new Error("PLATFORM_REQUEST_NOT_FOUND");

    return await request.update({
        status:     data.status,
        comments:   data.comments ?? request.comments,
        updated_at: new Date(),
    }, { transaction });
}