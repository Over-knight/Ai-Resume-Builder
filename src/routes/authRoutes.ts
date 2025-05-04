import express from "express";
import { 
    register, 
    login, 
    getProfile, 
    updateProfile } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { validateBody } from "../middlewares/validate";
import { registerSchema, 
    updateProfileSchema, 
    loginSchema } from "../schemas/authSchemas";
const router = express.Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login",validateBody(loginSchema) , login);


router.get("/profile", protect, getProfile );
router.put("/profile", protect,validateBody(updateProfileSchema) ,updateProfile );
export default router;