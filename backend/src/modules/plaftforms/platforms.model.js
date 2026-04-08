import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";
import dispatch_packaging from "../dispatch_packaging/dispatch_packaging.model.js";

const platforms = sequelize.define("platforms", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    type: {
        type: DataTypes.ENUM('Custom', 'Preset'),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    id_dispatch_packaging: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    width: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    height: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    length: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
    },
    number_of_pieces: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
    tableName: "platforms",
    timestamps: false
});

    // Relaciones
platforms.belongsTo(dispatch_packaging, { 
    foreignKey: "id_dispatch_packaging", 
    as: "dispatch_packaging" 
});

export default platforms;