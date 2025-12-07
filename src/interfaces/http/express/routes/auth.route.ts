import { Router } from "express";
import {
    registerHandler,
    loginHandler,
    logoutHandler,
    logoutAllHandler,
    refreshTokenHandler,
    getSessionsHandler,
} from "../controllers/auth.controller";
import { authenticate } from "../../../../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/refresh", refreshTokenHandler);

router.post("/logout", logoutHandler);
router.post("/logout-all", authenticate, logoutAllHandler);
router.get("/sessions", authenticate, getSessionsHandler);

export default router;
