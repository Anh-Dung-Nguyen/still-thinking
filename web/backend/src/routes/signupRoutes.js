import express from "express";
import { checkAvailability, resendVerificationEmail, resendVerificationPhone, signup, verifyEmail, verifyPhone } from "../controllers/signupControllers.js";

const router = express.Router();

router.post("/check-availability", checkAvailability);
router.post("/signup", signup);
router.get("/verify-email/:token", verifyEmail);
router.post("/verify-phone", verifyPhone);
router.post("/resend-verification-email", resendVerificationEmail);
router.post("/resend-verification-phone", resendVerificationPhone);

export default router;