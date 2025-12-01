import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/status", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: 'Server is healthy',
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    });
});

export default app;
