import express from "express";
import { checkAvailability, forgotPassword, getMe, refreshToken, resendVerificationCode, resendVerificationEmail, resendVerificationPhone, resetPassword, signin, signout, signup, verifyCode, verifyEmail, verifyPhone, verifyResetCode } from "../controllers/authControllers.js";
import { protect } from "../middleware/middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/check-availability", checkAvailability);
router.post("/verify-code", verifyCode);
router.get("/verify-email/:email", verifyEmail);
router.post("/verify-phone", verifyPhone);
router.post("/resend-code", resendVerificationCode);
router.post("/resend-verification-email", resendVerificationEmail);
router.post("/resend-verification-phone", resendVerificationPhone);

router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getMe);
router.post("/signout", protect, signout);
router.post("/refresh-token", protect, refreshToken);

export default router;