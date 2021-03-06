import { Router, RequestHandler } from "express";
import { set_user_id_middleware } from "../middlewares/auth.middleware";

interface todoController {
    list: RequestHandler;
    get: RequestHandler;
    create: RequestHandler;
    modify: RequestHandler;
    remove: RequestHandler;
}

export function get_todo_router(controller: todoController) {
    const router = Router();

    router.use(set_user_id_middleware);
    router.route("/")
        .get(controller.list)
        .post(controller.create);
    router.route("/:ticket_id(\\d+)")
        .get(controller.get)
        .patch(controller.modify)
        .delete(controller.remove);
    
    return router;
}