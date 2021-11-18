import { Router, RequestHandler } from "express";
import { get_user_controller } from "../controlls/users.controll";
import { set_user_id_middleware } from "../middlewares/auth.middleware";

interface user_controller {
    signup: RequestHandler;
    login: RequestHandler;
    info: RequestHandler;
}

export function get_user_router(controller: user_controller) {
    const router = Router();

    router.post("/signup", controller.signup);
    router.post("/login", controller.login);
    router.get("/information", set_user_id_middleware, controller.info);

    return router;
}
