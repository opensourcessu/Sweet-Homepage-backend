import moment, { Moment } from "moment";
import { Request, Response } from "express";
import { widgetService } from "../services/widget.service";

export function get_widget_controller(widget_service: widgetService) {
    async function widget_list(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }

        const result = await widget_service.list(user_id);

        res.status(200).json(result);
        return;
    }

    async function create(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }

        const req_check = {
            widget_type_id: typeof(req.body.widget_type_id) === "number",
            pos_x: typeof(req.body.pos_x) === "number",
            pos_y: typeof(req.body.pos_y) === "number",
            size_x: typeof(req.body.size_x) === "number",
            size_y: typeof(req.body.size_y) === "number",
            raw_data: req.body.raw_data === undefined || typeof(req.body.raw_data) === "string",
        }

        if (!Object.values(req_check).every(val => val)) {
            res.status(409).json(req_check);
            return;
        }

        const result = await widget_service.create(user_id, {
            widget_type_id: req.body.widget_type_id,
            location: {
                pos: [req.body.pos_x, req.body.pos_y],
                size: [req.body.size_x, req.body.size_y],
            },
            raw_data: req.body.raw_data,
        });

        if (result === undefined) {
            res.status(409).end();
            return;
        }

        res.status(201).json(result);
        return;
    }

    async function modify(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }

        const widget_id = parseInt(req.params.widget_id)

        const req_check = {
            widget_id: !isNaN(widget_id),
            pos_x: typeof(req.body.pos_x) === "number",
            pos_y: typeof(req.body.pos_y) === "number",
            size_x: typeof(req.body.size_x) === "number",
            size_y: typeof(req.body.size_y) === "number",
            raw_data: req.body.raw_data === undefined || typeof(req.body.raw_data) === "string",
        }

        if (!Object.values(req_check).every(val => val)) {
            res.status(409).json(req_check);
            return;
        }

        const result = await widget_service.modify(
            user_id, 
            widget_id, 
            {
                pos: [req.body.pos_x, req.body.pos_y],
                size: [req.body.size_x, req.body.size_y],
            }, 
            req.body.raw_data
        );

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

        const widget_id = parseInt(req.params.widget_id);
        if (isNaN(widget_id)) {
            res.status(409).end();
            return;
        }

        const result = await widget_service.remove(user_id, widget_id);

        const status_code = result === undefined ? 404 : 204;

        res.status(status_code).end();
        return;
    }

    return {
        widget_list,
        create,
        modify,
        remove,
    };
}