import {DataTypes} from "sequelize";
import {sequelize} from "../../config/database.js";

const Producto = sequelize.define("Producto", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  embalaje: {
    type: DataTypes.STRING,
    allowNull: false
  },
  calibre: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  espesor: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  no_parte: {
    type: DataTypes.STRING,
    allowNull: false
  },
  largo: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  peso_unit: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  familia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
});

export default Producto;
