import { Router } from "express";
import {
  login,
  createSuperUser,
  getLoginUser,
  addLicense,
  addUser,
  updateStatus,
  renewLicense,
  getOwnersByAdmin,
  updateUserField,
  getUsers,
  getUserById,
  updateUser,
  getUsersByParentId,
  getUsersByAssignedHotel,
  getUsersByAdmin,
  getLicenseDate,
  deleteUsersByRole,
} from "../controllers/users.controller.js";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router();

router.post("/create-superuser", createSuperUser);
router.post("/add-user", checkToken, addUser);
router.post("/add-license", checkToken, addLicense);
router.patch("/update-status", checkToken, updateStatus);
router.patch("/update-field", checkToken, updateUserField);
router.patch("/renew-license", checkToken, renewLicense);
router.patch("/update-user/:user_id", checkToken, updateUser);

router.post("/login", login);
router.get("/get-login-user", checkToken, getLoginUser);
router.get("/get-owners-by-admin", checkToken, getOwnersByAdmin);
router.get("/get-users", checkToken, getUsers);
router.get("/get-user-by-id/:user_id", checkToken, getUserById);
router.get("/get-users-by-parent/:parent_id", checkToken, getUsersByParentId);
router.get("/get-users-by-admin", checkToken, getUsersByAdmin);
router.get(
  "/get-users-by-hotel/:hotel_id",
  checkToken,
  getUsersByAssignedHotel
);

router.get("/get-license-Date", checkToken, getLicenseDate);

router.delete("/delete-users-by-role/:role", deleteUsersByRole);
export default router;
