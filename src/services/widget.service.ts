import moment, { Moment } from "moment";
import { Client } from "pg";

interface widgetLocation {
    pos: [number, number],
    size: [number, number]
}

interface widgetCreationDTO {
    widget_type_id: number;
    location: widgetLocation;
    raw_data?: string;
}

interface widgetDTO extends widgetCreationDTO {
    widget_id: number;
    raw_data: string;
};

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

    private query_res_to_widgetDTO(val: widgetQueryResDTO) {
        const widget: widgetDTO = {
            widget_id: val.widget_id,
            widget_type_id: val.widget_type_id,
            location: {
                pos: [val.pos_x, val.pos_y],
                size: [val.size_x, val.size_y],
            },
            raw_data: val.raw_data,
        };
        return widget;
    }

    private check_overlap(old_widgets: widgetDTO[], new_widget: widgetCreationDTO) {
        const overlapped_widgets: widgetDTO[] = [];
        if (!(new_widget.location.size[0] > 0 && new_widget.location.size[0] > 0)) {
            throw TypeError("Invalid widget size");
        }

        const new_lu_point = [
            // left, up
            new_widget.location.pos[0],
            new_widget.location.pos[1]
        ];
        const new_rd_point = [
            // right, down
            new_widget.location.pos[0] + new_widget.location.size[0] - 1,
            new_widget.location.pos[1] + new_widget.location.size[1] - 1
        ];

        for (const old_widget of old_widgets) {
            const old_lu_point = [
                old_widget.location.pos[0],
                old_widget.location.pos[1]
            ];
            const old_rd_point = [
                old_widget.location.pos[0] + old_widget.location.size[0] - 1,
                old_widget.location.pos[1] + old_widget.location.size[1] - 1
            ];

            const is_overlap = !(
                (old_rd_point[0] < new_lu_point[0] || old_rd_point[1] < new_lu_point[1]) ||
                // new의 왼쪽 위 꼭지점이 old 사각형보다 오른쪽 또는 아래에 있거나
                (new_rd_point[0] < old_lu_point[0] || new_rd_point[1] < old_lu_point[1])
                // new의 오른쪽 아래 꼭지점이 old 사각형보다 왼쪽 또는 위에 있거나
                // search, todo 같은 widget은 한개 초과로 있을 수 없으므로, 그런 경우도 체크하기
            );

            if (is_overlap) {
                overlapped_widgets.push(old_widget);
            }
        }

        return overlapped_widgets;
    }

    public async list(user_id: number) {
        const query = "SELECT widget_id, widget_type_id, pos_x, pos_y, size_x, size_y, raw_data FROM widgets WHERE user_id = $1 ORDER BY widget_id;";
        const result = await this.pg_client.query<widgetQueryResDTO>(query, [user_id]);

        return {
            count: result.rowCount,
            widgets: result.rows.map(this.query_res_to_widgetDTO),
        };
    }

    //get?

    public async create(user_id: number, widget_data: widgetCreationDTO) {
        // transaction 설정 필요
        const old_widgets = (await this.list(user_id)).widgets;

        const overlapped_widgets = this.check_overlap(old_widgets, widget_data);

        if (overlapped_widgets.length !== 0) {
            return {
                overlapped: overlapped_widgets
            };  
        }

        const query = "INSERT INTO widgets (widget_type_id, pos_x, pos_y, size_x, size_y, raw_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING widget_id, widget_type_id, pos_x, pos_y, size_x, size_y, raw_data;";
        const result = await this.pg_client.query<widgetQueryResDTO>(query, [
            widget_data.widget_type_id,
            widget_data.location.pos[0],
            widget_data.location.pos[1],
            widget_data.location.size[0],
            widget_data.location.size[1],
            widget_data.raw_data
        ]);
        
        return this.query_res_to_widgetDTO(result.rows[0]);
    }

    public async modify(user_id: number, widget_id: number, location: widgetLocation, raw_data?: string) {
        // 검사 및 이동, 내용 변경. transaction 설정 필요
        const old_widgets = (await this.list(user_id)).widgets;

        const target_widget_index = old_widgets.findIndex(val => val.widget_id === widget_id);
        if (target_widget_index === -1) {
            return;
        }
        
        const widget_type_id = old_widgets[target_widget_index].widget_type_id;

        old_widgets.splice(target_widget_index, 1);

        const overlapped_widgets = this.check_overlap(old_widgets, {
            widget_type_id: widget_type_id,
            location: location
        });

        if (overlapped_widgets.length !== 0) {
            return {
                overlapped: overlapped_widgets
            };
        }
        let i = 5;
        const params: (number | string)[] = [location.pos[0], location.pos[1], location.size[0], location.size[1], user_id, widget_id];
        if (raw_data !== undefined) {
            params.splice(4, 0, raw_data);
        }
        const query = `UPDATE widgets SET pos_x = $1, pos_y = $2, size_x = $3, size_y = $4${raw_data !== undefined ? `, raw_data = $${i++}` : ""} WHERE user_id = $${i++} AND widget_id = $${i++} RETURNING widget_id, widget_type_id, pos_x, pos_y, size_x, size_y, raw_data;`
        const result = await this.pg_client.query<widgetQueryResDTO>(query, params);

        if (result.rowCount === 0) {
            return;
        } else {
            return this.query_res_to_widgetDTO(result.rows[0]);
        }
    }

    public async remove(user_id: number, widget_id: number) {
        const query = "DELETE FROM widgets WHERE user_id = $1 AND widget_id = $2 RETURNING widget_id, widget_type_id, pos_x, pos_y, size_x, size_y, raw_data;";
        const result = await this.pg_client.query<widgetQueryResDTO>(query, [user_id, widget_id]);

        return result.rowCount === 0 ? undefined : this.query_res_to_widgetDTO(result.rows[0]);
    }
}