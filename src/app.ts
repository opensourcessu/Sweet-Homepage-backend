import express from "express";
import moment from "moment";
import { Client } from "pg";
import { todoService } from "./services/todo.service";
import { get_user_controller, get_todo_controller } from "./controls";
import { get_user_router, get_todo_router } from "./routes";
import { port, db_config } from "./settings";

const app = express();
const pg_client = new Client(db_config);
const todo_service = new todoService(pg_client);

app.use(express.json());

app.get("/", function (req, res) {
    const now_iso = moment().toISOString();

    res.status(200).json({
        time: now_iso
    });
});

app.use("/users", get_user_router(get_user_controller(pg_client)));
app.use("/todo", get_todo_router(get_todo_controller(todo_service)));

pg_client.connect();

app.listen(port, function () {
    console.log(`Sweet Homepage backend run on port ${port}`);
});