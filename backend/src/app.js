import express from "express";
import cors from "cors";

//Routes
import consignatariosRoutes from "./modules/consignatarios/consignatarios.routes.js";
import configRoutes from "./modules/consignatarios/config.routes.js";
import clientesRoutes from "./modules/clientes/clientes.routes.js";
import productRoutes from "./modules/products/products.routes.js";
import contactRoutes from "./modules/contacts/contacts.routes.js";
import platformRoutes from "./modules/plaftforms/platforms.routes.js";
import platformRequestRoutes from "./modules/platform_request/platform_request.routes.js";
import platformItemRoutes from "./modules/platform_items/platform_items.routes.js";
import dispatchRoutes from "./modules/dispatch_packaging/dispatch.routes.js";
import usuariosRoutes from "./modules/usuarios/usuarios.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Auth and Users endpoints (public login/register)
app.use('/api/usuarios', usuariosRoutes);

// Protected module endpoints
app.use('/api/consignatarios', consignatariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/platform_request', platformRequestRoutes);
app.use('/api/items', platformItemRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use("/api", configRoutes);

export default app;
