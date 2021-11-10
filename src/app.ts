import express from "express";
import moment from "moment";
import { Client } from "pg";
import { get_user_controller } from "./controlls/users.controll";
import { get_user_router } from "./routes/users.route";
import { port, db_config } from "./settings";

const app = express();
const pg_client = new Client(db_config);

app.use(express.json());

app.get("/", function (req, res) {
    const now_iso = moment().toISOString();

    res.status(200).json({
        time: now_iso
    });
});

app.use("/users", get_user_router(get_user_controller(pg_client)));

pg_client.connect();

app.listen(port, function () {
    console.log(`Sweet Homepage backend run on port ${port}`);
});