import { Router, RequestHandler } from "express";
import { get_user_controller } from "../controlls/users.controll";

interface user_controller {
    user_signup: RequestHandler,
    // user_login: RequestHandler,
    // user_info: RequestHandler
}

export function get_user_router(controller: user_controller) {
    const router = Router();

    router.post("/signup", controller.user_signup);

    router.post("/login", function (req, res) {

    });

    router.get("/information", function (req, res) {

    });

    return router;
}
