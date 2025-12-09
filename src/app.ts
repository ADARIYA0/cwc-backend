import express from "express";
import applyCors from "./middlewares/cors.middleware";
import logger from "./infrastructure/logging/logger";
import morgan from "morgan";

import authRoute from "./interfaces/http/express/routes/auth.route";
import userRoute from "./interfaces/http/express/routes/user.route";
import storeRoute from "./interfaces/http/express/routes/store.route";
import productRoute from "./interfaces/http/express/routes/product.route";

const app = express();

app.use(express.json());
app.use(applyCors);

morgan.token("date", (req, res, tz) => {
    return new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
        hour12: false
    });
});

const morganFormat =
    ':remote-addr - - [:date[Asia/Jakarta] +0700] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

app.use(
    morgan(morganFormat, {
        stream: {
            write: (message: string) => logger.info(message.trim()),
        },
    })
);

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/stores", storeRoute);
app.use("/api/products", productRoute);

app.get("/status", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: 'Server is healthy',
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    });
});

export default app;
