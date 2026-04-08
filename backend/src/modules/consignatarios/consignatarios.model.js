import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";
import customers from "../clientes/clientes.model.js";
import dispatch_packaging from "../dispatch_packaging/dispatch_packaging.model.js";

const consignees = sequelize.define("consignees", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  id_customer: {
    type: DataTypes.UUID,
    allowNull: false
  },
  preferred_dispatch: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  min_load: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  max_load: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  max_pieces_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_width: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  max_height: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  max_internal_diameter: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  max_external_diameter: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  additional_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "consignees",
  timestamps: false
});

// Relaciones
consignees.belongsTo(customers, { foreignKey: "id_customer", onDelete: "CASCADE" });
consignees.belongsTo(dispatch_packaging, { foreignKey: "preferred_dispatch" });

export default consignees;