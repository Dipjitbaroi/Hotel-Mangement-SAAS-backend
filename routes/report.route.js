import { Router } from "express";
import { checkToken } from "../middlewares/checkToken.js";
import { getAllReport, getReport } from "../controllers/report.controller.js";
import { getReportsByDate, getReportsByHotelId } from "../controllers/Manager/report.controller.js";

const router = Router();

router.get("/get-report", checkToken, getReport);
router.get("/get-all-report", checkToken, getAllReport);
router.get(
  "/get-rooms-reports-by-hotel",
  checkToken,
  getReportsByHotelId
);
router.get("/get-reports-by-date", checkToken, getReportsByDate);

export default router;
