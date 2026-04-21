// config.routes.js
import { Router } from "express";
import { getConfigHandler } from "./config.handler.js"
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();
// Only Administrador can access config
router.get("/config", verifyToken, authorize('config', 'read'), getConfigHandler);

export default router;