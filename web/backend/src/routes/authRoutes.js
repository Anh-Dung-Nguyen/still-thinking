import express from "express";
import { checkAvailability, resendVerificationCode, resendVerificationEmail, resendVerificationPhone, signup, verifyCode, verifyEmail, verifyPhone } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/check-availability", checkAvailability);
router.post("/verify-code", verifyCode);
router.get("/verify-email/:email", verifyEmail);
router.post("/verify-phone", verifyPhone);
router.post("/resend-code", resendVerificationCode);
router.post("/resend-verification-email", resendVerificationEmail);
router.post("/resend-verification-phone", resendVerificationPhone);

export default router;