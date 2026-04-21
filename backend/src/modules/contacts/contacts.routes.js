import {Router} from 'express';
import { createContactHandler, getAllContactsHandler, getContactByIdHandler, updateContactHandler, deleteContactHandler } from './contacts.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

// For contacts, treat like clientes - Administrador only for create/update/delete
router.post('/', verifyToken, authorize('clientes', 'create'), createContactHandler);
router.get('/', verifyToken, authorize('clientes', 'read'), getAllContactsHandler);
router.get('/:id', verifyToken, authorize('clientes', 'read'), getContactByIdHandler);
router.put('/:id', verifyToken, authorize('clientes', 'update'), updateContactHandler);
router.delete('/:id', verifyToken, authorize('clientes', 'delete'), deleteContactHandler);

export default router;