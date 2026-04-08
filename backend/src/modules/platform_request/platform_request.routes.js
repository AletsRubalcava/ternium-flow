import {Router} from 'express';
import { getAllPlatformsRequestsHandler } from './platform_request.controller.js';

const router = Router();

//router.post('/', createConsigneeHandler);
router.get('/', getAllPlatformsRequestsHandler);
//router.get('/:id', getConsignatarioByIdHandler);
//router.put('/:id', updateConsigneeHandler);
//router.delete('/:id', deleteConsigneeHandler);

export default router;