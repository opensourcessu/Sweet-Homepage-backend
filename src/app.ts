import express from "express";
import moment from "moment";
import { port } from "./settings";

const app = express();

app.use(express.json());

app.get("/", function (req, res) {
    const now_iso = moment().toISOString();

    res.status(200).json({
        time: now_iso
    });
});

app.listen(port, function () {
    console.log(`Sweet Homepage backend run on port ${port}`);
});