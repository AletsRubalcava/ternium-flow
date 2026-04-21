import Usuario from './usuarios.model.js';
import bcrypt from 'bcrypt';

export async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await Usuario.create({
    nombre: data.nombre,
    email: data.email,
    password: hashedPassword,
    role: data.role || 'Cliente',
    id_cliente: data.id_cliente || null,
  });
  return user;
}

export async function findUserByEmail(email) {
  return await Usuario.findOne({ where: { email } });
}

export async function findUserById(id) {
  return await Usuario.findByPk(id, { attributes: { exclude: ['password'] } });
}

export async function getAllUsers() {
  return await Usuario.findAll({ attributes: { exclude: ['password'] } });
}

export async function updateUser(id, data) {
  const user = await Usuario.findByPk(id);
  if (!user) throw new Error('Usuario no encontrado');
  
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  await user.update(data);
  return user;
}

export async function deleteUser(id) {
  const user = await Usuario.findByPk(id);
  if (!user) throw new Error('Usuario no encontrado');
  await user.destroy();
  return true;
}

export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
