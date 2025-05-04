import { MongoExpiredSessionError } from "mongodb";
import z from "zod";

export const createResumeSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    summary: z.string().optional(),
    experience: z.array(
        z.object({
            company: z.string().min(1),
            role: z.string().min(1),
            duration: z.string().min(1),
        })
    ).optional(),
    education: z.array(
        z.object({
            school: z.string().min(1),
            degree: z.string().min(1),
            year: z.string().min(1),
        })
    ).optional(),
    skills: z.array(z.string()).optional(),
});

export const updateResumeSchema = createResumeSchema.partial();

export const extractKeywordsSchema = z.object({
    jobDescription: z.string().min(1, "Job description is required"),
});

export const scrapeJobsQuerySchema = z.object({
    jobTitle: z.string().min(1, "Job title is required"),
    location: z.string().min(1, "Location is required"),
});

export const coverLetterSchema = z.object({
    jobDescription: z.string().min(1, "Job description is required"),
});

export const optimizeSchema = coverLetterSchema;