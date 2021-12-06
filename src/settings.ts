import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT;

export const secret: string = process.env.SECRET === undefined ? "secret" : process.env.SECRET;

export const db_config = {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(<string>process.env.DB_PORT)
};

export const token_exp = {
    access: 60 * 60 * 24 * 180, //60 * 5,
    refresh: 60 * 60 * 24 * 180
};