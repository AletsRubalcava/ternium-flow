import { Router } from 'express';
import { 
  registerHandler, 
  loginHandler, 
  getAllUsersHandler, 
  getUserByIdHandler, 
  updateUserHandler, 
  deleteUserHandler 
} from './usuarios.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

// Public endpoints (no auth required)
router.post('/register', registerHandler);
router.post('/login', loginHandler);

// Protected endpoints - only Administrador can manage users
router.get('/', verifyToken, authorize('usuarios', 'read'), getAllUsersHandler);
router.get('/:id', verifyToken, authorize('usuarios', 'read'), getUserByIdHandler);
router.put('/:id', verifyToken, authorize('usuarios', 'update'), updateUserHandler);
router.delete('/:id', verifyToken, authorize('usuarios', 'delete'), deleteUserHandler);

export default router;
