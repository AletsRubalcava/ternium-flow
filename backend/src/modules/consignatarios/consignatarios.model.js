import {DataTypes} from "sequelize";
import {sequelize} from "../../config/database.js";
import Cliente from "../clientes/clientes.model.js";

const Consignatario = sequelize.define("Consignatario", {
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
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  diametro_interno: {
    //Puede haber multiples?
    //type: DataTypes.ARRAY(DataTypes.INTEGER),
    type: DataTypes.INTEGER,
    allowNull: false
  },
  diametro_externo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  peso_minimo_despacho: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  peso_maximo_despacho: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  no_piezas_por_paquete: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ancho_maximo_tarima: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  embalaje_despacho: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

Consignatario.belongsTo(Cliente, { foreignKey: "clienteId", allowNull: false, onDelete: "CASCADE" });

export default Consignatario;
