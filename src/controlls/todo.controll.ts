import moment from "moment";
import { Client } from "pg";
import { Request, Response } from "express";

export function get_todo_controller(pg_client: Client) {

    const subj_format = /.+/;
    const deadline_format = /^\d{4}-\d{2}-\d{2} ((0|1)\d|2[0-3]):[0-5]\d:[0-5]\d$/;

    async function list(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
        }

        const query = "SELECT ticket_id, subject, content, deadline, is_done, create_dt, update_dt FROM todo_lists WHERE user_id = $1 AND delete_dt IS NULL";
        const result = await pg_client.query(query, [user_id]);

        res.status(200).json({
            count: result.rowCount,
            tickets: result.rows,
        });

        return;
    }

    async function get(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
        }

        const ticket_id = req.params.ticket_id;

        const query = "SELECT ticket_id, subject, content, deadline, is_done, create_dt, update_dt FROM todo_lists WHERE user_id = $1 AND ticket_id = $2";
        const result = await pg_client.query(query, [user_id, ticket_id]);

        if (result.rowCount === 0) {
            res.status(404).end()
        }

        res.status(200).json(...result.rows[0]);

        return;
    }

    async function create(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
        }

        const now = moment().toISOString();

        const subject: string = req.body.subject;
        const content: string = req.body.content;
        var deadline: string = req.body.deadline;

        const subj_format_test = subj_format.test(subject);
        const deadline_format_test = deadline_format.test(deadline);

        if (subj_format_test || deadline_format_test) {
            const detail_obj: { subject?: string; deadline?: string; } = {};
            if (subj_format_test)
                detail_obj.subject = subj_format.toString();
            if (deadline_format_test)
                detail_obj.deadline = deadline_format.toString();
            res.status(409).json({
                msg: "wrong data format",
                detail: detail_obj
            })
        }

        deadline = moment.utc(deadline).toISOString();

        const query = "INSERT INTO todo_lists (subject, content, deadline, create_dt, update_dt) VALUES ($1, $2, $3, $4, $5) RETURNING ticket_id;";

        const result = await pg_client.query(query, [subject, content, deadline, now, now]);

        res.status(201).json({
            ticket_id: result.rows[0].ticket_id,
        });

        return;
    }

    async function modify(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
        }

        const ticket_id = parseInt(req.params.ticket_id);
        if (isNaN(ticket_id)) {
            res.status(409).end();
        }

        const now = moment().toISOString();

        if (!(req.body.subject === undefined || subj_format.test(req.body.subject))) {
            res.status(409).end()
        }

        if (!(req.body.deadline === undefined || deadline_format.test(req.body.deadline))) {
            res.status(409).end()
        }

        if (!(req.body.is_done === undefined || typeof(req.body.is_done) === "boolean")) {
            res.status(409).end()
        }

        const properties = { subject: 0, content: 0, deadline: 0, is_done: 0 };
        const entries = Object.entries(req.body);
        const updating_entries = [];
        const updating_data = [];

        var i = 1;
        for (const [key, value] of entries) {
            if (key in properties) {
                updating_entries.push(`${key} = $${i++})`);
                updating_data.push(value);
            }
        }

        const query = `UPDATE todo_lists SET ${updating_entries.join(", ")}, update_dt = $${i++} WHERE user_id = $${i++} AND ticket_id = $${i++} RETURNING ticket_id, subject, content, deadline, is_done, update_dt`;

        const result = await pg_client.query(query, [...updating_data, now, user_id, ticket_id]);

        if (result.rowCount === 0) {
            res.status(404).end();
        } else {
            res.status(200).json(result.rows[0]);
        }

        return;
    }

    async function remove(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
        }

        const ticket_id = parseInt(req.params.ticket_id);
        if (isNaN(ticket_id)) {
            res.status(409).end();
        }

        const query = "DELETE FROM todo_lists WHERE user_id = $1 AND ticket_id = $2;";

        const result = await pg_client.query(query, [user_id, ticket_id]);

        const status_code = result.rowCount === 0 ? 404 : 204;

        res.status(status_code).end();

        return;
    }

    return {
        list,
        get,
        create,
        modify,
        remove
    };
}