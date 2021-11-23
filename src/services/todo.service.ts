import moment, { Moment } from "moment";
import { Client } from "pg";

interface ticketQueryResDTO {
    ticket_id: number;
    subject: string;
    content: string;
    deadline: Date;
    status: number;
    create_dt: Date;
    update_dt: Date;
}

interface ticketCreationDTO {
    subject: string;
    content: string;
    deadline: Moment;
}

type ticketModificationDTO = Partial<ticketCreationDTO & { status: number }>;

export class todoService {
    
    private pg_client: Client;

    public constructor(pg_client: Client) {
        this.pg_client = pg_client;
    }

    public async list(user_id: number) {
        const query = "SELECT ticket_id, subject, content, deadline, status, create_dt, update_dt FROM todo_lists WHERE user_id = $1 AND delete_dt IS NULL ORDER BY ticket_id;";
        const result = await this.pg_client.query<ticketQueryResDTO>(query, [user_id]);

        return {
            count: result.rowCount,
            tickets: result.rows,
        };
    }

    public async get(user_id: number, ticket_id: number) {
        const query = "SELECT ticket_id, subject, content, deadline, status, create_dt, update_dt FROM todo_lists WHERE user_id = $1 AND ticket_id = $2;";
        const result = await this.pg_client.query<ticketQueryResDTO>(query, [user_id, ticket_id]);

        if (result.rowCount === 0) {
            return;
        } else {
            return result.rows[0];
        }
    }

    public async create(user_id: number, ticket_data: ticketCreationDTO) {
        const now = moment().toISOString();

        const query = "INSERT INTO todo_lists (user_id, subject, content, deadline, create_dt, update_dt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ticket_id, subject, content, deadline, status, create_dt, update_dt;";
        const result = await this.pg_client.query<ticketQueryResDTO>(query, [user_id, ticket_data.subject, ticket_data.content, ticket_data.deadline.toISOString(), now, now]);

        return result.rows[0];
    }

    public async modify(user_id: number, ticket_id: number, ticket_data: ticketModificationDTO) {
        const now = moment().toISOString();
        const properties = ["subject", "content", "deadline", "status"];
        const updating_properties = [];
        const updating_data = [];

        let i = 1;
        for (const [key, value] of Object.entries(ticket_data)) {
            if (properties.includes(key) && value !== undefined) {
                const val = value instanceof moment ? (<Moment>value).toISOString() : value;
                updating_properties.push(`${key} = $${i++}`);
                updating_data.push(val);
            }
        }

        const query = `UPDATE todo_lists SET ${updating_properties.join(", ")}, update_dt = $${i++} WHERE user_id = $${i++} AND ticket_id = $${i++} RETURNING ticket_id, subject, content, deadline, status, create_dt, update_dt;`;
        const result = await this.pg_client.query<ticketQueryResDTO>(query, [...updating_data, now, user_id, ticket_id]);

        if (result.rowCount === 0) {
            return;
        } else {
            return result.rows[0];
        }
    }

    public async remove(user_id: number, ticket_id: number) {
        const query = "DELETE FROM todo_lists WHERE user_id = $1 AND ticket_id = $2 RETURNING ticket_id, subject, content, deadline, status, create_dt, update_dt;";
        const result = await this.pg_client.query<ticketQueryResDTO>(query, [user_id, ticket_id]);

        if (result.rowCount === 0) {
            return;
        } else {
            return result.rows[0];
        }
    }
}