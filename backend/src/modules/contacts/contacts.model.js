import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";
import customers from "../clientes/clientes.model.js";

const contacts = sequelize.define("contacts", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    id_customer: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: "customers",
        key: "id",
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    position: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
        isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
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
    tableName: "contacts",
    timestamps: false,
    validate: {
        eitherEmailOrPhone() {
        if (!this.email && !this.phone) {
            throw new Error('Se requiere al menos un correo o un teléfono.');
        }
        }
    }
});

// Relaciones
contacts.belongsTo(customers, { 
    foreignKey: "id_customer", 
    onDelete: "CASCADE",
    as: "customer" 
});

export default contacts;