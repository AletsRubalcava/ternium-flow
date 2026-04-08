import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";
import platforms from "../plaftforms/platforms.model.js";
import consignees from "../consignatarios/consignatarios.model.js";

const platform_request = sequelize.define("platform_request", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    id_platform: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: "platforms",
        key: "id",
        },
    },
    id_consignee: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: "consignees",
        key: "id",
        },
    },
    status: {
        type: DataTypes.ENUM('Aceptada', 'Rechazada', 'Pendiente'),
        defaultValue: 'Pendiente',
        allowNull: false,
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: "platform_request",
    timestamps: false // Se definen manualmente para control total
});

// Relaciones (Asociaciones)
platform_request.belongsTo(platforms, { 
    foreignKey: "id_platform", 
    as: "platform" 
});

platform_request.belongsTo(consignees, { 
    foreignKey: "id_consignee", 
    as: "consignee" 
});

export default platform_request;