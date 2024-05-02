import { Router } from "express";
import { checkToken } from "../middlewares/checkToken.js";
import { getTransactionLogs } from "../controllers/transaction.controller.js";

const router = Router();

router.get("/get-transactionlogs", checkToken, getTransactionLogs);

export default router;
