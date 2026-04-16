import { Router } from "express";
import { getRecommendationHandler } from "./prediction.controller.js";

const router = Router();

router.post("/recommendation", getRecommendationHandler);

export default router;
