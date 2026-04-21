import followUps from "./followUp.model.js";
import { followUpStatus } from "../../../../shared/followup_status.js";
import { Op } from "sequelize";

export async function createFollowUp(data, transaction) {
    const today = new Date();
    const datePart = today.toISOString().slice(0,10).replace(/-/g, ""); // 20260420

    const last = await followUps.findOne({
        where: {
            tracking_key: {
                [Op.like]: `SEG-${datePart}-%`
            }
        },
        order: [["tracking_key", "DESC"]],
        transaction
    });

    let nextNumber = 1;

    if (last) {
        const match = last.tracking_key.match(/-(\d+)$/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }

    const tracking_key = `SEG-${datePart}-${String(nextNumber).padStart(4, "0")}`;
    
    return followUps.create(
        {
            id_request: data.id_request,
            tracking_key: tracking_key,
            status: followUpStatus.pending,
            comment: data.comment ?? null,
        },
        { transaction }
    );
}

export async function updateFollowUp(id, data, transaction) {
    await followUps.update(
        {
            status: data.status,
            comment: data.comment ?? null,
        },
        {
            where: { id },
            transaction,
        }
    );

    return followUps.findByPk(id, { transaction });
}

export async function getAllFollowUps() {
    return followUps.findAll();
}

export async function getFollowUpByID(id) {
    return followUps.findByPk(id);
}