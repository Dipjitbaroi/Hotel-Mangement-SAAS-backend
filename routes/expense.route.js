import { Router } from "express";
import { checkToken } from "../middlewares/checkToken.js";
import { addExpense, getExpenseById, getExpenses, reduceExpense, updateExpense } from "../controllers/expense.controller.js";


const router = Router();

router.post("/add-expense", checkToken, addExpense);
router.get("/get-expense-by-id/:expense_id", checkToken, getExpenseById);
router.get("/get-expenses", checkToken, getExpenses);
router.patch("/update-expense/:expense_id", checkToken, updateExpense);
router.post("/reduce-expense/:expense_id", checkToken, reduceExpense);
export default router;
