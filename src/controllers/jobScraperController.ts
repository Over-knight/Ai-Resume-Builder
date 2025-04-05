import axios from "axios";
import * as cheerio from "cheerio";
import { Request, Response } from "express";
import { title } from "process";

export const scrapeJobs = async (req: Request, res: Response): Promise<void> => {
    try{
        const { jobTitle, location } = req.query;
        if (!jobTitle || !location) {
            res.status(400).json({ message: "Job title and location are required" });
            return;
        }
    const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(
        jobTitle as string 
    )}&1=${encodeURIComponent(location as string)}`;

    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);

    let jobs: { 
        title: string;
        company: string;
        link: string;
    }[] = [];
    $(".job_seen_beacon").each((index, element) => {
        const title = $(element).find("h2 a").text().trim();
        const company = $(element).find(".companyName").text().trim();
        const link = "http:www.indeed.com" + $(element).find("h2 a").attr("href");
        if (title && company && link) {
            jobs.push({ title, company, link });
        }
    });

    
    res.status(200).json({ jobs });
} catch (error: any) {
    console.error("Error scraping job listings:", error);
    res.status(500).json({ message: "Failed to scrape job listings", error: error.message});
    }
};