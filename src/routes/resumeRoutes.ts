import express from "express";
import { createResume, getResumes, extractJobKeywords } from "../controllers/resumeController";
import {scrapeJobs} from "../controllers/jobScraperController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", protect, createResume);
router.get("/", getResumes);
router.post("/", extractJobKeywords);
router.get("/scrape-jobs", scrapeJobs);


router.post("/extract-keywords", extractJobKeywords);


export default router;

