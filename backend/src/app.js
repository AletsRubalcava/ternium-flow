import express from "express";
import cors from "cors";


//Routes
import consignatariosRoutes from "./modules/consignatario/consignatarios.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/consignatarios', consignatariosRoutes);




export default app;
