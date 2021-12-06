import { Request, Response } from "express";
import { pageSettingService } from "../services/pagesetting.service";

export function get_page_setting_controller(page_setting_service: pageSettingService) {

    async function get(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }

        const result = await page_setting_service.get(user_id);

        res.status(200).json(result);
        return;
    }

    async function set(req: Request, res: Response) {
        const user_id = req.user_id;
        if (user_id === undefined) {
            res.status(401).end();
            return;
        }

        const body = req.body;
        
        if (!("bg_color" in body && "font" in body)) {
            res.status(409).end();
            return;
        }

        const result = await page_setting_service.set(user_id, { bg_color: body.bg_color, font: body.font });
        res.status(200).json(result);
        return;
    }

    return {
        get,
        set
    };
}