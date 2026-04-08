import {Router} from 'express';
import { createConsigneeHandler, getAllConsignatariosHandler, getConsignatarioByIdHandler, updateConsigneeHandler, deleteConsigneeHandler } from './consignatarios.controller.js';

const router = Router();

router.post('/', createConsigneeHandler);
router.get('/', getAllConsignatariosHandler);
router.get('/:id', getConsignatarioByIdHandler);
router.put('/:id', updateConsigneeHandler);
router.delete('/:id', deleteConsigneeHandler);

export default router;