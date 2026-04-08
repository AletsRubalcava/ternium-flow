import {Router} from 'express';
import { createCustomerHandler, getAllCustomersHandler, getCustomerByIdHandler, updateCustomerHandler, deleteCustomerHandler } from './clientes.controller.js';

const router = Router();

router.post('/', createCustomerHandler);
router.get('/', getAllCustomersHandler);
router.get('/:id', getCustomerByIdHandler);
router.put('/:id', updateCustomerHandler);
router.delete('/:id', deleteCustomerHandler);

export default router;
