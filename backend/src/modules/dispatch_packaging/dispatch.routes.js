import {Router} from 'express';
import { getDispatchByIdHandler, getAllDispatchesHandler } from './dispatch.controller.js';

const router = Router();

//router.post('/', createCustomerHandler);
router.get('/', getAllDispatchesHandler);
router.get('/:id', getDispatchByIdHandler);
//router.put('/:id', updateCustomerHandler);
//router.delete('/:id', deleteCustomerHandler);

export default router;
