import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('Administrador', 'Cliente', 'Ejecutivo', 'Operador'),
    allowNull: false,
    defaultValue: 'Cliente',
  },
  id_cliente: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Usuario;
