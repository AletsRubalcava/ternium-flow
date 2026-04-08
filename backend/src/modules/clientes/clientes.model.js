import {DataTypes} from "sequelize";
import {sequelize} from "../../config/database.js";

const customers = sequelize.define("customers", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  id_customer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rfc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tax_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false, 
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW()
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW()
  }
}, {
    timestamps: false
});

export default customers;
