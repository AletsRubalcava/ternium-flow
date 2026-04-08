import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";

const dispatch_packaging = sequelize.define("dispatch_packaging", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: "dispatch_packaging",
    timestamps: false 
});

export default dispatch_packaging;