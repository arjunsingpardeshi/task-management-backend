import { Router } from "express";
import { changeCurrentPassword, forgotPasswordRequest, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, resendEmailVerification, resetForgottenPassword, verifyUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegistrationValidator } from "../validators/index.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/authentication.middleware.js";

const router = Router();

router.route("/register").post(upload.single(`avatar`), userRegistrationValidator(), validate, registerUser);
router.route("/verify/:token").get(verifyUser);
router.route("resend-verification/:token").get(resendEmailVerification);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/logout").post(isLoggedIn, logoutUser);
router.route("/forgot-password").post(forgotPasswordRequest);
router.route("/reset-password/:token").get(resetForgottenPassword);
router.route("/change-password").post(isLoggedIn, changeCurrentPassword);
router.route("/getMe").get(isLoggedIn, getCurrentUser);
router.route("/refresh-access-token").post(isLoggedIn, refreshAccessToken);
//router.route("/logout").post(isLoggedIn, logout)
export default router