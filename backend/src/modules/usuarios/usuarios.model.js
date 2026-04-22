import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const users = sequelize.define('users', {
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
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'administrador',
    validate: {
      isIn: [['administrador', 'gestion_clientes', 'operador_logistico', 'customer']]
    }
  },
  id_cliente: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default users;
