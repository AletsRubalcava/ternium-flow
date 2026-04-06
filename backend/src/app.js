import express from "express";
import cors from "cors";


//Routes
import consignatariosRoutes from "./modules/consignatarios/consignatarios.routes.js";
import clientesRoutes from "./modules/clientes/clientes.routes.js";
import productosRoutes from "./modules/productos/productos.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/consignatarios', consignatariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);




export default app;
