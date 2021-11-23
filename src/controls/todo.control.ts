import moment, { Moment } from "moment";
import { Request, Response } from "express";
import { todoService } from "../services/todo.service";

export function get_todo_controller(todo_service: todoService) {

    const subj_format = /.+/;
    const deadline_format = /^\d{4}-\d{2}-\d{2} ((0|1)\d|2[0-3]):[0-5]\d:[0-5]\d$/;

    async function list(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }

        const result = await todo_service.list(user_id);

        res.status(200).json(result);
        return;
    }

    async function get(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }

        const ticket_id = parseInt(req.params.ticket_id);
        if (isNaN(ticket_id)) {
            res.status(400).end();
            return;
        }

        const result = await todo_service.get(user_id, ticket_id);
        if (result === undefined) {
            res.status(404).end();
            return;
        }

        res.status(200).json(result);
        return;
    }

    async function create(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }        

        const subject: string = req.body.subject;
        const content: string = req.body.content;
        var deadline: string = req.body.deadline;

        const subj_format_test = subj_format.test(subject);
        const deadline_format_test = deadline_format.test(deadline);

        if (subj_format_test || deadline_format_test) {
            // request data format check and generate error message
            const detail_obj: { subject?: string; deadline?: string; } = {};

            if (subj_format_test)
                detail_obj.subject = subj_format.toString();

            if (deadline_format_test)
                detail_obj.deadline = deadline_format.toString();

            res.status(409).json({
                msg: "wrong data format",
                detail: detail_obj
            })
            return;
        }

        const result = await todo_service.create(user_id, {
            subject,
            content,
            deadline: moment.utc(deadline)
        });

        res.status(201).json(result);
        return;
    }

    async function modify(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }

        const ticket_id = parseInt(req.params.ticket_id);

        const req_check = {
            ticket_id: !isNaN(ticket_id),
            subject: req.body.subject === undefined || (typeof(req.body.subject) === "string" && subj_format.test(req.body.subject)),
            content: req.body.content === undefined || typeof(req.body.content) === "string",
            deadline: req.body.deadline === undefined || (typeof(req.body.deadline) === "string" && deadline_format.test(req.body.deadline)),
            status: req.body.status === undefined || typeof(req.body.status) === "number"
        }

        if (Object.values(req_check).every((val) => val)) {
            res.status(409).json(req_check);
            return;
        }

        const result = await todo_service.modify(user_id, ticket_id, {
            subject: req.body.subject,
            content: req.body.content,
            deadline: moment.utc(req.body.deadline),
            status: req.body.status
        });

        if (result === undefined) {
            res.status(404).end();
            return;
        }

        res.status(200).json(result);
        return;
    }

    async function remove(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }

        const ticket_id = parseInt(req.params.ticket_id);
        if (isNaN(ticket_id)) {
            res.status(409).end();
            return;
        }

        const result = await todo_service.remove(user_id, ticket_id);

        const status_code = result === undefined ? 404 : 204;

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