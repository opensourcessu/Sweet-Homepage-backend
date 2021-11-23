import jwt, { JwtPayload } from "jsonwebtoken";
import moment from "moment";
import { secret, token_exp } from "../settings";

export enum tokenType { access = "access", refresh = "refresh" };

export function verify_token(token: string, token_type: tokenType): number {
    const payload = <JwtPayload>jwt.verify(token, secret, { subject: token_type });
    return parseInt(payload.id);
}

export function create_token(user_id: number, token_type: tokenType, now?: number): string {
    const now_sec = now === undefined ? moment().unix() : now;
    const exp = now_sec + (token_type === tokenType.access ? token_exp.access : token_exp.refresh);
    const token = jwt.sign({
        exp: exp,
        sub: token_type,
        id: user_id
    }, secret);

    return token;
}