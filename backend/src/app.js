import express from "express";
import cors from "cors";
import { navIds } from "../../shared/navigation.js"

//Routes
import consignatariosRoutes from "./modules/consignatarios/consignatarios.routes.js";
import clientesRoutes from "./modules/clientes/clientes.routes.js";
import productRoutes from "./modules/products/products.routes.js"
import dispatchRoutes from "./modules/dispatch_packaging/dispatch.routes.js"
import platformRoutes from './modules/plaftforms/platforms.routes.js';
import platformRequestRoutes from "./modules/platform_request/platform_request.routes.js"
import contactRoutes from "./modules/contacts/contacts.routes.js"
import platformItemRoutes from "./modules/platform_items/platform_items.routes.js"
import followUpsRoutes from "./modules/followups/followUp.routes.js"
import configRoutes from "./modules/consignatarios/config.routes.js";
import predictionRoutes from "./modules/prediction/prediction.routes.js";
import usuariosRoutes from "./modules/usuarios/usuarios.routes.js"
import visualizarionRoutes from "./modules/plaftforms/unity.platform.api.js"

const app = express();

app.use(cors());
app.use(express.json());

// Protected module endpoints
app.use('/api/consignees', consignatariosRoutes);
app.use('/api/customers', clientesRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/platform_request', platformRequestRoutes);
app.use('/api/items', platformItemRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/follow_ups', followUpsRoutes);
app.use("/api", configRoutes);
app.use("/api/prediction", predictionRoutes);
app.use('/api/users', usuariosRoutes);
app.use('/api', visualizarionRoutes);

export default app;
