import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT;

export const db_config = {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(<string>process.env.DB_PORT)
};