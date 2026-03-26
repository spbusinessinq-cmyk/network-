import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import signalsRouter from "./signals.js";
import casesRouter from "./cases.js";
import messagesRouter from "./messages.js";
import roomsRouter from "./rooms.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/signals", signalsRouter);
router.use("/cases", casesRouter);
router.use("/messages", messagesRouter);
router.use("/rooms", roomsRouter);

export default router;
