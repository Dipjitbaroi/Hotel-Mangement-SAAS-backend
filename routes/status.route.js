import { Router } from "express";
import { checkToken } from "../middlewares/checkToken.js";
import { getStatusLogs } from "../controllers/statuslog.controller.js";

const router = Router();

router.get("/get-statuslogs", checkToken, getStatusLogs)

export default router;