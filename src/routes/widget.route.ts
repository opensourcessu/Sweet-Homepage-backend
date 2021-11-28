import { Router, RequestHandler } from "express";
import { set_user_id_middleware } from "../middlewares/auth.middleware";

interface widgetController {
    widget_type_list: RequestHandler;
    widget_list: RequestHandler;
    create: RequestHandler;
    modify: RequestHandler;
    remove: RequestHandler;
}

export function get_widget_router(controller: widgetController) {
    const router = Router();

    router.use(set_user_id_middleware);
    router.route("/")
        .get(controller.widget_list)
        .post(controller.create);
    router.route("/types")
        .get(controller.widget_type_list);
    router.route("/:widget_id(\\d+)")
        .patch(controller.modify)
        .delete(controller.remove);

    return router;
}