import express from "express";
import { createResume, 
    getResumes, 
    extractJobKeywords, 
    updateResume, 
    deleteResume, 
    downloadResumeDOCX, 
    downloadResumePDF, 
    generateCoverLetter, 
    enhancedOptimization } from "../controllers/resumeController";
import {scrapeJobs} from "../controllers/jobScraperController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", protect, createResume);
router.get("/", protect, getResumes);
router.post("/", extractJobKeywords);
router.get("/scrape-jobs", scrapeJobs);

router.post("/extract-keywords", extractJobKeywords);
router.put("/:id", protect, updateResume);
router.delete("/:id", protect,deleteResume);

router.get("/:id/download/docx", protect, downloadResumeDOCX);
router.get("/:id/download/pdf", protect, downloadResumePDF);

router.post("/:id/cover-letter",protect, generateCoverLetter);
router.post("/:id/optimize", protect, enhancedOptimization)
export default router;

