import {Router} from 'express';
import { createConsignatarioHandler } from './consignatarios.controller.js';

const router = Router();

router.post('/', createConsignatarioHandler);

export default router;