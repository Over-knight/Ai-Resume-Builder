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
    import { validateBody, validateQuery } from "../middlewares/validate";
import {scrapeJobs} from "../controllers/jobScraperController";
import { protect } from "../middlewares/authMiddleware";
import { createResumeSchema, 
    updateResumeSchema, 
    extractKeywordsSchema, 
    coverLetterSchema, 
    scrapeJobsQuerySchema, 
    optimizeSchema } from "../schemas/resumeSchemas";

const router = express.Router();

router.post("/", protect,validateBody(createResumeSchema) ,createResume);
router.get("/", protect, getResumes);
router.post("/", extractJobKeywords);
router.get("/scrape-jobs", validateQuery(scrapeJobsQuerySchema), scrapeJobs);

router.post("/extract-keywords",validateBody(extractKeywordsSchema) ,extractJobKeywords);
router.put("/:id", protect, validateBody(updateResumeSchema), updateResume);
router.delete("/:id", protect,deleteResume);

router.get("/:id/download/docx", protect, downloadResumeDOCX);
router.get("/:id/download/pdf", protect, downloadResumePDF);

router.post("/:id/cover-letter",protect, validateBody(coverLetterSchema), generateCoverLetter);
router.post("/:id/optimize", protect, validateBody(optimizeSchema), enhancedOptimization)
export default router;

