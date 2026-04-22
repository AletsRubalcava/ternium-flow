import { Router } from 'express';
import {
  createUserHandler,
  loginHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
} from './usuarios.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

// ── Público ───────────────────────────────────────────────────────────────────
router.post('/login', loginHandler);

// ── Protegidos (requieren token) ──────────────────────────────────────────────
router.post('/',     verifyToken, authorize('usuarios', 'create'), createUserHandler);
router.get('/',      verifyToken, authorize('usuarios', 'read'),   getAllUsersHandler);
router.get('/:id',   verifyToken, authorize('usuarios', 'read'),   getUserByIdHandler);
router.put('/:id',   verifyToken, authorize('usuarios', 'update'), updateUserHandler);
router.delete('/:id',verifyToken, authorize('usuarios', 'delete'), deleteUserHandler);

export default router;