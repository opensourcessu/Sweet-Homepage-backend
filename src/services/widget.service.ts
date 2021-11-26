import moment, { Moment } from "moment";
import { Client } from "pg";

interface widgetLocation {
    pos: [number, number],
    size: [number, number]
}

interface widgetCreationDTO {
    widget_type_id: number;
    location: widgetLocation;
    raw_data: string;
}

interface widgetQueryResDTO {
    widget_id: number;
    widget_type_id: number;
    pos_x: number;
    pos_y: number;
    size_x: number;
    size_y: number;
    raw_data: string;
}

// widget에 timestamp 추가

export class widgetService {

    private pg_client: Client;

    public constructor(pg_client: Client) {
        this.pg_client = pg_client;
    }

    public async list(user_id: number) {
        const query = "SELECT widget_id, widget_type_id, pos_x, pos_y, size_x, size_y, raw_data FROM widgets WHERE user_id = $1 ORDER BY widget_id;";
        const result = await this.pg_client.query<widgetQueryResDTO>(query, [user_id]);

        return {
            count: result.rowCount,
            widgets: result.rows,
        };
    }

    //get?

    public async create(user_id: number, widget_data: widgetCreationDTO) {
        // 검사
        const query = "INSERT INTO widgets (widget_type_id, pos_x, pos_y, size_x, size_y, raw_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING widget_id, widget_type_id, pos_x, pos_y, size_x, size_y, raw_data;";
        const result = await this.pg_client.query<widgetQueryResDTO>(query, [
            widget_data.widget_type_id,
            widget_data.location.pos[0],
            widget_data.location.pos[1],
            widget_data.location.size[0],
            widget_data.location.size[1],
            widget_data.raw_data
        ]);

        return result.rows[0];
    }

    public async modify(user_id: number, widget_id: number, location: widgetLocation, raw_data?: string) {
        // 검사 및 이동, 내용 변경
    }

    public async remove(user_id: number, widget_id: number) {
        const query = "DELETE FROM widgets WHERE user_id = $1 AND widget_id = $2 RETURNING widget_id, widget_type_id, pos_x, pos_y, size_x, size_y, raw_data;";
        const result = await this.pg_client.query<widgetQueryResDTO>(query, [user_id, widget_id]);

        return result.rowCount === 0 ? undefined : result.rows[0];
    }
}