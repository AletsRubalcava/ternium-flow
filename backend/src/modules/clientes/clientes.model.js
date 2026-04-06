import {DataTypes} from "sequelize";
import {sequelize} from "../../config/database.js";

const Cliente = sequelize.define("Cliente", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rfc: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion_fiscal: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false, 
    defaultValue: true
    }
});

export default Cliente;
