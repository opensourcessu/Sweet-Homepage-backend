import moment from "moment";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";
import { Client } from "pg";
import { Request, Response } from "express";
import { secret } from "../settings";

export function get_user_controller(pg_client: Client) {

    async function user_signup(req: Request, res: Response) {
        const { id, password, name } = req.body;
        const now = moment().toISOString();
        const query = "INSERT INTO sw_users (login_id, name, password, create_dt, update_dt) VALUES ($1, $2, $3, $4, $5);";
        
        const result = await pg_client.query(query, [id, name, password, now, now]);

        console.log({ result });

        res.status(201).end();
    }

    async function user_login(req: Request, res: Response) {
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
            const token = jwt.sign({
                exp: now_sec + 60 * 5,
                sub: "access",
                id: user.user_id
            }, secret);

            res.status(200).json({
                access_token: token
            });
        }
    }

    async function user_info(req: Request, res: Response) {
        const token_prefix = "jwt ";
        const auth_header = req.header("Authorization");

        const access_token = typeof auth_header === "string" && auth_header.startsWith(token_prefix) ? auth_header.slice(token_prefix.length) : "";
        if (!access_token) {
            res.status(401).end();
            return;
        }

        var payload: JwtPayload;
        
        try {
            payload = <JwtPayload>jwt.verify(access_token, secret, {subject: "access"});
        } catch (e) {
            res.status(401).end();
            return;
        }

        const query = "SELECT login_id, name, create_dt FROM sw_users WHERE user_id = $1";

        const result = await pg_client.query(query, [payload.id]);

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
        user_signup,
        user_login,
        user_info
    };
}