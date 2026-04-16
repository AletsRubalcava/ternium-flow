import {DataTypes} from "sequelize";
import {sequelize} from "../../config/database.js";

const products = sequelize.define("products", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  caliber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  thickness: {
    type: DataTypes.NUMERIC(10, 4),
    allowNull: false
  },
  part_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  length: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false
  },
  width: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false
  },
  unit_weight: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false
  },
  family: {
    type: DataTypes.STRING,
    allowNull: true
  },
  internal_diameter: {
    type: DataTypes.NUMERIC(10,2),
    allowNull: false
  },
  external_diameter: {
    type: DataTypes.NUMERIC(10,2),
    allowNull: false
  },
    status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
    tableName: "products",
    timestamps: false
});

export default products;
