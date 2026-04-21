import {Router} from 'express';
import { createCustomerHandler, getAllCustomersHandler, getCustomerByIdHandler, updateCustomerHandler, deleteCustomerHandler } from './clientes.controller.js';
import { verifyToken, authorize, checkOwnership } from '../../middlewares/auth.js';

const router = Router();

// Only Administrador can create customers
router.post('/', verifyToken, authorize('clientes', 'create'), createCustomerHandler);
// All authenticated users can list (Administrador, Ejecutivo see all; Cliente sees own via filtering in controller)
router.get('/', verifyToken, authorize('clientes', 'read'), getAllCustomersHandler);
// Get by id: Administrador full access, Cliente can only read own
router.get('/:id', verifyToken, authorize('clientes', 'read'), checkOwnership('id'), getCustomerByIdHandler);
// Update: Administrador can update any, Cliente can update own
router.put('/:id', verifyToken, authorize('clientes', 'update'), checkOwnership('id'), updateCustomerHandler);
// Delete: only Administrador
router.delete('/:id', verifyToken, authorize('clientes', 'delete'), deleteCustomerHandler);

export default router;
