import jwt, { JwtPayload } from "jsonwebtoken";
import moment from "moment";
import { secret } from "../settings";

export function verify_access_token(access_token: string): number {
    const payload = <JwtPayload>jwt.verify(access_token, secret, { subject: "access" });
    return parseInt(payload.id);
}

export function create_access_token(user_id: number): string {
    const now_sec = moment().unix();
    const token = jwt.sign({
        exp: now_sec + 60 * 5,
        sub: "access",
        id: user_id
    }, secret);

    return token;
}