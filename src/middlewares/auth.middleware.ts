import { Request, Response, NextFunction} from "express";
import { verify_access_token } from "../services/authtoken.service";

export function set_user_id_middleware(req: Request, res: Response, next: NextFunction) {
    const token_prefix = "jwt ";
    const auth_header = req.header("Authorization");
    const access_token = typeof auth_header === "string" && auth_header.startsWith(token_prefix) ? auth_header.slice(token_prefix.length) : "";

    if (access_token) {
        try {
            const user_id = verify_access_token(access_token);
            req.user_id = user_id;
        } catch (e) {
            console.log("wrong access token");
        }
    }

    next();
}