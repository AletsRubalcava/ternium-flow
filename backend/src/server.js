import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js"

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}
startServer()