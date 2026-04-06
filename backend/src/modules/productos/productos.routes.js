import {Router} from 'express';
import { createProductoHandler, getAllProductosHandler, getProductoByIdHandler, updateProductoHandler } from './productos.controller.js';

const router = Router();

router.post('/', createProductoHandler);
router.get('/', getAllProductosHandler);
router.get('/:id', getProductoByIdHandler);
router.put('/:id', updateProductoHandler);

export default router;
