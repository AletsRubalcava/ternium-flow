import users from './usuarios.model.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

export async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await users.create({
    nombre:     data.nombre,
    email:      data.email,
    password:   hashedPassword,
    role:       data.role || 'GestionCliente',
    estado:     data.estado ?? true,
    id_cliente: data.id_cliente || null,
  });
  return user;
}

export async function findUserByEmail(email) {
  return await users.findOne({ where: { email } });
}

export async function findUserById(id) {
  return await users.findByPk(id, { attributes: { exclude: ['password'] } });
}

export async function getAllUsers() {
  return await users.findAll({ attributes: { exclude: ['password'] } });
}

export async function updateUser(id, data) {
  const user = await users.findByPk(id);
  if (!user) throw new Error('Usuario no encontrado');

  // Guard: no dejar sin el último admin
  if (data.role && data.role !== 'administrador' && user.role === 'administrador') {
    const adminCount = await users.count({ where: { role: 'administrador' } });
    if (adminCount <= 1) {
      throw new Error('Debe existir al menos un administrador en el sistema.');
    }
  }

  // Guard: email duplicado excluyendo al usuario actual
  if (data.email && data.email !== user.email) {
    const existing = await users.findOne({
      where: { email: data.email, id: { [Op.ne]: id } },
    });
    if (existing) throw new Error('Email ya registrado por otro usuario.');
  }

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  await user.update(data);
  return user;
}

export async function deleteUser(id) {
  const user = await users.findByPk(id);
  if (!user) throw new Error('Usuario no encontrado');

  if (user.role === 'administrador') {
    const adminCount = await users.count({ where: { role: 'administrador' } });
    if (adminCount <= 1) {
      throw new Error('Debe existir al menos un administrador en el sistema.');
    }
  }

  await user.destroy();
  return true;
}

export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}