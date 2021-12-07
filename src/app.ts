import express from "express";
import cors from "cors";
import moment from "moment";
import { Client } from "pg";
import { todoService } from "./services/todo.service";
import { widgetService } from "./services/widget.service";
import { pageSettingService } from "./services/pagesetting.service";
import { get_user_controller, get_todo_controller, get_widget_controller, get_page_setting_controller } from "./controls";
import { get_user_router, get_todo_router, get_widget_router, get_page_setting_router } from "./routes";
import { port, db_config } from "./settings";

const app = express();
const pg_client = new Client(db_config);
const todo_service = new todoService(pg_client);
const widget_service = new widgetService(pg_client);
const page_setting_service = new pageSettingService(pg_client);

app.use(cors({
    origin: true
}));
app.use(express.json({
    limit: "50MB"
}));

app.get("/", function (req, res) {
    const now_iso = moment().toISOString();

    res.status(200).json({
        time: now_iso
    });
});

app.use("/users", get_user_router(get_user_controller(pg_client)));
app.use("/tasks", get_todo_router(get_todo_controller(todo_service)));
app.use("/widgets", get_widget_router(get_widget_controller(widget_service)));
app.use("/pagesetting", get_page_setting_router(get_page_setting_controller(page_setting_service)));

pg_client.connect();

app.listen(port, function () {
    console.log(`Sweet Homepage backend run on port ${port}`);
});