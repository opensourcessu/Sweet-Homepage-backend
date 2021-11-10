import moment from "moment";
import { Client } from "pg";
import { Request, Response } from "express";

export function get_user_controller(pg_client: Client) {

    async function user_signup(req: Request, res: Response) {
        const { id, password, name } = req.body;
        const now = moment().toISOString();
        const query = "INSERT INTO sw_users (login_id, name, password, create_dt, update_dt) VALUES ($1, $2, $3, $4, $5);";
        
        const result = await pg_client.query(query, [id, name, password, now, now]);

        console.log({ result });

        res.status(201).end();
    }

    return {
        user_signup
    };
}