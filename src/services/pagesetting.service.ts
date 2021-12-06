import { Client } from "pg";

interface pageSettingDTO {
    bg_color: string;
    font: string;
}

export class pageSettingService {

    private pg_client: Client;

    public constructor(pg_client: Client) {
        this.pg_client = pg_client;
    }

    public async get(user_id: number) {
        const query = "SELECT bg_color, font FROM sw_users WHERE user_id = $1";
        const result = await this.pg_client.query<pageSettingDTO>(query, [user_id]);

        if (result.rowCount === 0) {
            return;
        } else {
            return result.rows[0];
        }
    }

    public async set(user_id: number, page_setting: pageSettingDTO) {
        const query = "UPDATE sw_users SET bg_color = $1, font = $2 WHERE user_id = $3 RETURNING bg_color, font";
        const result = await this.pg_client.query<pageSettingDTO>(query, [page_setting.bg_color, page_setting.font, user_id]);

        if (result.rowCount === 0) {
            return;
        } else {
            return result.rows[0];
        }
    }
}