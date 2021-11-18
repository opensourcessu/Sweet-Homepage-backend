import moment from "moment";
import { Client } from "pg";
import { Request, Response } from "express";
import { create_access_token } from "../services/authtoken.service";

export function get_user_controller(pg_client: Client) {

    async function signup(req: Request, res: Response) {
        const { id, password, name } = req.body;
        const now = moment().toISOString();
        const query = "INSERT INTO sw_users (login_id, name, password, create_dt, update_dt) VALUES ($1, $2, $3, $4, $5);";
        
        const result = await pg_client.query(query, [id, name, password, now, now]);

        console.log({ result });

        res.status(201).end();
    }

    async function login(req: Request, res: Response) {
        const now_sec = moment().unix();
        const { id, password } = req.body;
        const query = "SELECT user_id, name, create_dt, update_dt FROM sw_users WHERE login_id = $1 AND password = $2 AND delete_dt IS NULL";

        const result = await pg_client.query(query, [id, password]);

        console.log({ result });
        console.log({ row: result.rows[0]});
        
        if (result.rowCount === 0) {
            res.status(404).end();
        } else {
            const user = result.rows[0];
            const token = create_access_token(user.user_id);

            res.status(200).json({
                access_token: token
            });
        }
    }

    async function info(req: Request, res: Response) {
        const user_id = req.user_id;

        if (user_id === undefined) {
            res.status(401).end();
        }

        const query = "SELECT login_id, name, create_dt FROM sw_users WHERE user_id = $1";

        const result = await pg_client.query(query, [user_id]);

        if (result.rowCount === 0) {
            res.status(401).end();
        } else {
            const user = result.rows[0];
            
            res.status(200).json({
                id: user.login_id,
                name: user.name,
                create_dt: user.create_dt
            });
        }

        return;
    }

    return {
        signup,
        login,
        info
    };
}