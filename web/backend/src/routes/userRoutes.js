import express from "express";
import { optionalAuth, protect } from "../middleware/middleware.js";
import { getCompleteProfile, getMyProfile, getPublicProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/:userId/profile", optionalAuth, getPublicProfile);
router.get("/:userId/profile/complete", optionalAuth, getCompleteProfile);
router.get("/me/profile", protect, getMyProfile);

export default router;