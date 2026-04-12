// config.routes.js
import { Router } from "express";
import { getConfigHandler } from "./config.handler.js"

const router = Router();
router.get("/config", getConfigHandler);

export default router;