import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false, // Disable logging; set to console.log to see SQL queries
    }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connected")

    await sequelize.sync()
    console.log("Models synchronized")
  } catch (error) {
    console.error("Database connection error:", error)
    process.exit(1)
  }
}