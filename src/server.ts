import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.log("All connections closed. Exiting process.");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("Forcing shutdown...");
        process.exit(1);
    }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM")); 
