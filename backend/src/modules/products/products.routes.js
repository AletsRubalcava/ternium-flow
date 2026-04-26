import {Router} from 'express';
import { createProductHandler, getAllProductsHandler, getProductByIdHandler, updateProductHandler, deleteProductHandler, productIsInUseHandler } from './products.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

// Create: only Administrador
router.post('/', verifyToken, authorize('productos', 'create'), createProductHandler);
// Get all: Administrador, Ejecutivo, Operador can read
router.get('/', verifyToken, authorize('productos', 'read'), getAllProductsHandler);
// Get by id: all authorized roles can read
router.get('/:id', verifyToken, authorize('productos', 'read'), getProductByIdHandler);
// Update: only Administrador
router.put('/:id', verifyToken, authorize('productos', 'update'), updateProductHandler);
// Delete: only Administrador
router.delete('/:id', verifyToken, authorize('productos', 'delete'), deleteProductHandler);

router.get("/:id/in-use", verifyToken, authorize("productos", "read"), productIsInUseHandler);

export default router;