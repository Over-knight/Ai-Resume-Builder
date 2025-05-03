// import axios from "axios";

//     // const { data } = await axios.get(searchUrl, {
//     //     headers: {
//     //         "User-Agent":
//     //         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
//     //       "AppleWebKit/537.36 (KHTML, like Gecko) " +
//     //       "Chrome/90.0.4430.212 Safari/537.36",
//     //     "Accept-Language": "en-US,en;q=0.9",
//     //     },
//     // });


import { Request, Response } from "express";
import puppeteer, { Browser, Page } from "puppeteer";
import * as cheerio from "cheerio";

export const scrapeJobs = async (req: Request, res: Response): Promise<void> => {
  const { jobTitle, location } = req.query;
  if (!jobTitle || !location) {
    res.status(400).json({ message: "Job title and location are required" });
    return;
  }

  // Build the correct Indeed search URL
  const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(
    jobTitle as string
  )}&l=${encodeURIComponent(location as string)}`;

  let browser: Browser | null = null;

  try {
    // Launch headless browser
    browser = await puppeteer.launch({ headless: true });
    const page: Page = await browser.newPage();

    // Set browser headers
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/90.0.4430.212 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9"
    });

    // Navigate to the page and wait for loading
    await page.goto(searchUrl, { waitUntil: "networkidle2" });

    // Get the fully rendered HTML
    const html = await page.content();
    const $ = cheerio.load(html);

    // Extract job listings
    const jobs: Array<{ title: string; company: string; link: string }> = [];
    $(".job_seen_beacon").each((_, el) => {
      const title = $(el).find("h2 a").text().trim();
      const company = $(el).find(".companyName").text().trim();
      const href = $(el).find("h2 a").attr("href") || "";
      const link = href.startsWith("http")
        ? href
        : `https://www.indeed.com${href}`;
      if (title && company && link) {
        jobs.push({ title, company, link });
      }
    });

    // Return the scraped jobs
    res.status(200).json({ jobs });
  } catch (error: any) {
    console.error("Error scraping job listings:", error);
    res
      .status(500)
      .json({ message: "Failed to scrape job listings", error: error.message });
  } finally {
    // Ensure the browser is closed
    if (browser) {
      await browser.close();
    }
  }
};
