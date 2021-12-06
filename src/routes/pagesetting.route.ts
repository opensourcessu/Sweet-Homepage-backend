import { Router, RequestHandler } from "express";
import { set_user_id_middleware } from "../middlewares/auth.middleware";
 
interface pageSettingController {
    get: RequestHandler;
    set: RequestHandler;
}

export function get_page_setting_router(controller: pageSettingController) {
    const router = Router();

    router.use(set_user_id_middleware);
    router.route("/")
        .get(controller.get)
        .patch(controller.set);

    return router;
}