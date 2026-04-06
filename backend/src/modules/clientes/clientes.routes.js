import {Router} from 'express';
import { createClienteHandler, getAllClientesHandler, getClienteByIdHandler, updateClienteHandler, deleteClienteHandler } from './clientes.controller.js';

const router = Router();

router.post('/', createClienteHandler);
router.get('/', getAllClientesHandler);
router.get('/:id', getClienteByIdHandler);
router.put('/:id', updateClienteHandler);
router.delete('/:id', deleteClienteHandler);

export default router;
