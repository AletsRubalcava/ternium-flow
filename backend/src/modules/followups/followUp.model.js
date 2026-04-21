import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";
import platform_request from "../platform_request/platform_request.model.js";

const follow_ups = sequelize.define("follow_ups",
{
    id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    },

    id_request: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
        model: platform_request, // mejor que string
        key: "id",
    },
    },

    tracking_key: {
    type: DataTypes.STRING,
    allowNull: false,
    },

    status: {
    type: DataTypes.STRING,
    allowNull: false,
    },

    comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    },
},
{
    tableName: "follow_ups",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
}
);

// Relaciones
follow_ups.belongsTo(platform_request, {
    foreignKey: "id_request",
    as: "request",
});

platform_request.hasMany(follow_ups, {
    foreignKey: "id_request",
    as: "history",
});

export default follow_ups;