import express from "express";
import cors from "cors";


//Routes
import consignatariosRoutes from "./modules/consignatarios/consignatarios.routes.js";
import clientesRoutes from "./modules/clientes/clientes.routes.js";
import productRoutes from "./modules/products/products.routes.js"
import dispatchRoutes from "./modules/dispatch_packaging/dispatch.routes.js"
import platformRoutes from './modules/plaftforms/platforms.routes.js';
import platformRequestRoutes from "./modules/platform_request/platform_request.routes.js"
import contactRoutes from "./modules/contacts/contacts.routes.js"
import platformItemRoutes from "./modules/platform_items/platform_items.routes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/consignees', consignatariosRoutes);
app.use('/api/customers', clientesRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/platform_request', platformRequestRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/items', platformItemRoutes);

export default app;