import express from "express";

const app = express();
const port = 8000;

app.use(express.json());

app.get("/", function (req, res) {
    res.status(200).json({
        msg: "Hello"
    });
});

app.listen(port, function () {
    console.log(`Sweet Homepage backend run on port ${port}`);
});