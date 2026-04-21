import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  verifyPassword,
} from './usuarios.service.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function registerHandler(req, res) {
  try {
    const { nombre, email, password, role, id_cliente } = req.body;
    
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y password son requeridos' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email ya registrado' });
    }

    const user = await createUser({ nombre, email, password, role, id_cliente });
    const safe = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.role,
      id_cliente: user.id_cliente,
    };

    res.status(201).json(safe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
}

export async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password requeridos' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, id_cliente: user.id_cliente },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        id_cliente: user.id_cliente,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en autenticación' });
  }
}

export async function getAllUsersHandler(req, res) {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
}

export async function getUserByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const user = await findUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
}

export async function updateUserHandler(req, res) {
  try {
    const { id } = req.params;
    const user = await updateUser(id, req.body);
    const safe = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.role,
      id_cliente: user.id_cliente,
    };
    res.status(200).json(safe);
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
}

export async function deleteUserHandler(req, res) {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
}
