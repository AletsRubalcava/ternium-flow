import {Router} from 'express';
import { createProductHandler, getAllProductsHandler, getProductByIdHandler, updateProductHandler, deleteProductHandler } from './products.controller.js';

const router = Router();

router.post('/', createProductHandler);
router.get('/', getAllProductsHandler);
router.get('/:id', getProductByIdHandler);
router.put('/:id', updateProductHandler);
router.delete('/:id', deleteProductHandler);

export default router;