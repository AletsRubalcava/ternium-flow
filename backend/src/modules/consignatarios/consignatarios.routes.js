import {Router} from 'express';
import { createConsignatarioHandler, getAllConsignatariosHandler, getConsignatarioByIdHandler, updateConsignatarioHandler, deleteConsignatarioHandler } from './consignatarios.controller.js';

const router = Router();

router.post('/', createConsignatarioHandler);
router.get('/', getAllConsignatariosHandler);
router.get('/:id', getConsignatarioByIdHandler);
router.put('/:id', updateConsignatarioHandler);
router.delete('/:id', deleteConsignatarioHandler);

export default router;