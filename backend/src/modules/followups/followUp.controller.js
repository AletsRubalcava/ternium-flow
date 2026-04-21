import { sequelize } from "../../config/database.js";
import { createFollowUp, updateFollowUp, getAllFollowUps, getFollowUpByID } from "./followUp.service.js";
import followUps from "./followUp.model.js";

export async function createFollowUpHandler(req, res) {
    const data = req.body;

    const tracking_key = data.tracking_key?.trim();
    const id_request = data.id_request;

    if (!id_request) {
        return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    try {
        const created = await sequelize.transaction(async (t) => {
            return await createFollowUp(
                {
                    id_request,
                    comment: data.comment ?? null
                },
                t
            );
        });

        return res.status(201).json(created);

    } catch (error) {
        console.error(error);

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ error: "VALIDATION_ERROR" });
        }

        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function updateFollowUpHandler(req, res) {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
        return res.status(400).json({ error: "MISSING_ID" });
    }

    const status = data.status?.trim();
    const comment = data.comment;

    if (!status) {
        return res.status(400).json({ error: "MISSING_STATUS" });
    }

    try {
        const updated = await sequelize.transaction(async (t) => {
            const followUp = await followUps.findByPk(id, { transaction: t });

            if (!followUp) {
                const err = new Error("FOLLOWUP_NOT_FOUND");
                throw err;
            }

            return await updateFollowUp(
                id,
                { status, comment },
                t
            );
        });

        return res.status(200).json(updated);

    } catch (error) {
        console.error(error);

        if (error.message === "FOLLOWUP_NOT_FOUND") {
            return res.status(404).json({ error: "FOLLOWUP_NOT_FOUND" });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ error: "VALIDATION_ERROR" });
        }

        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function getAllFollowUpsHandler(req, res) {
    try {
        const followUp = await getAllFollowUps();
        res.status(200).json(followUp);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}

export async function getFollowUpsByIdHandler(req, res) {
    const { id } = req.params;
    try {
        const followUp = await getFollowUpByID(id);
        if (!followUp) return res.status(404).json({ error: "PLATFORM_NOT_FOUND" });
        res.status(200).json(followUp);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}
