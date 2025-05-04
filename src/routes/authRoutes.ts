import express from "express";
import { 
    register, 
    login, 
    getProfile, 
    updateProfile } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);


router.get("/profile", protect, getProfile );
router.put("/profile", protect, updateProfile );
export default router;