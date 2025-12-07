import { DeviceInfo } from "../dto/login.dto";
import { Request } from "express";

const parseDevice = (userAgent: string): string => {
    if (!userAgent) return "Unknown Device";

    const ua = userAgent.toLowerCase();

    if (ua.includes("iphone")) return "iPhone";
    if (ua.includes("ipad")) return "iPad";
    if (ua.includes("android")) {
        if (ua.includes("mobile")) return "Android Phone";
        return "Android Tablet";
    }

    if (ua.includes("windows")) return "Windows PC";
    if (ua.includes("macintosh") || ua.includes("mac os")) return "Mac";
    if (ua.includes("linux")) return "Linux PC";

    if (ua.includes("mobile")) return "Mobile Device";

    return "Desktop";
};

export const extractDeviceInfo = (req: Request): DeviceInfo => {
    const forwarded = req.headers["x-forwarded-for"];
    let ipAddress: string;

    if (typeof forwarded === "string") {
        // Take the first IP if there are multiple
        ipAddress = forwarded.split(",")[0]?.trim() || "unknown";
    } else if (Array.isArray(forwarded)) {
        ipAddress = forwarded[0] || "unknown";
    } else {
        ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    }

    const userAgent = req.headers["user-agent"] || "Unknown";

    const device = parseDevice(userAgent);

    return {
        device,
        ipAddress,
        userAgent,
    };
};
