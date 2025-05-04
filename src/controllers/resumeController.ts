import { Request, Response } from "express";
import Resume from "../models/resumeModel";
import nlp from "compromise";
import PDFDocument, { resume } from "pdfkit";
import { Document as DocxDocument, Packer, Paragraph, TextRun } from "docx";
import { textModel } from "../lib/genaiClient";
// import { genAI } from "../lib/genaiClient";
// import stopword from "stopword";
import { RequestHandler } from "express";

export const createResume = async (req: Request, res: Response) => {
    try {
        const resume = await Resume.create({ user: req.body.user, ...req.body });
        res.status(201).json(resume);   
    } catch (error) {
        console.error("Error creating resume:", error);
        res.status(500).json({ message: "Error creating resume"});
        return;
    }
};

export const getResumes = async (req: Request, res: Response): Promise<void> => {
    try{
        const userId = req.query.user;
        if (!userId){
            res.status(400).json({ message: "User ID is required" });
            return;
        }
        const resumes = await Resume.find({ user: userId });
        res.status(200).json(resumes);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching resumes"});
        return;
    }
};

export const updateResume= async (req: Request, res:Response ): Promise<void> => {
    try{
        const resumeId = req.params.id;
        const updates = req.body;

        const updated= await Resume.findByIdAndUpdate(
            resumeId,
            { $set: updates },
            { new: true, runValidators: true }
        );
        if(!updated) {
            res.status(404).json({message: "Resume not found"});
            return;
        }
        res.status(200).json(updated);
        return;
    } catch (error: any) {
        console.error("Error updating resume:", error);
        res.status(500).json({ message: "Error updating resumes", error: error.message });
        return;
    }
}

export const deleteResume = async (req: Request, res: Response): Promise<void> => {
    try{
        const resumeId = req.params.id;
        const deleted = await Resume.findByIdAndDelete(resumeId);

        if(!deleted) {
            res.status(404).json({ message: "Resume not found" });
            return;
        }

        res.status(200).json({ message:"Resume deleted successfully"});
        return;
    } catch(error: any) {
        console.error("Error deleting resume: ", error);
        res.status(500).json({ message: "Error deleting resume", error: error.message});
        return;
    }
}
export const extractJobKeywords: RequestHandler = (req: Request, res: Response) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription) {
            res.status(400).json({ message: "Job description is required"});
            return;
        }
        //processing NLP (Natural Language Processing)
        const doc = nlp(jobDescription);
        let skills = doc.nouns().out("array");
    
        //removing stopwords
        // skills = stopword.removeStopwords(skills);
        res.status(200).json({ extractedSkills: skills });
        return;
    } catch (error) {
        console.error("Error extracting job keywords:", error);
        res.status(500).json({ message: "Server error"});
        return;
    }
    
};
//GET/api/resumes/:id/download/pdf
// protected
export const downloadResumePDF = async (req: Request, res: Response) :Promise<void> => {
    try {
        const resume = await Resume.findById(req.params.id);
        if(!resume) {
            res.status(404).json({ message: "Resume not found" });
            return;
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${resume.fullName}.pdf"`
        );
        const doc = new PDFDocument();
        doc.pipe(res);

        doc.fontSize(20).text(resume.fullName, { underline: true });
        doc.moveDown();
        if (resume.summary) {
            doc.fontSize(12).text("Summary:").font("Helvetica-Bold");
            // doc.font('Helvetica-Bold').text("Summary:");
            doc.text(resume.summary);
            doc.moveDown();
        }
        if (resume.experience?.length) {
            doc.fontSize(12).text("Experience:").font("Helvetica-Bold");
            resume.experience.forEach((exp) => {
                doc.text(`• ${exp.role} at ${exp.company} (${exp.duration})`);
            });
            doc.moveDown();
        }
        if (resume.education?.length) {
            doc.fontSize(12).text("Education:").font("Helvetica-Bold");
            resume.education.forEach((edu) => {
                doc.text(`• ${edu.degree} from ${edu.school} (${edu.year})`);
            });
            doc.moveDown();
        }
        if (resume.skills?.length) {
            doc.fontSize(12).text("Skills:").font("Helvetica-Bold");
            doc.text(resume.skills.join(" , "));
        }
        doc.end();
    } catch(error:any) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: "Error generating PDF", error: error.message });
        return;
    }
};
// new Paragraph({
//     text: `${exp.role} at ${exp.company} (${exp.duration})`,
//     bullet: { level: 0 }
//   })
//GET/api/resumes/:id/download/docx
//protected
export const downloadResumeDOCX = async (req: Request, res: Response):Promise<void> => {
    try{
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            res.status(404).json({ message: "Resume not found" });
            return;
        }

        const doc = new DocxDocument({
            sections: [
                {
                    children: [
                        new Paragraph({
                            text: resume.fullName,
                            heading: "Heading1",
                        }),
                        ...(resume.experience?.length
                            ? [
                                new Paragraph({text: "Education:", spacing: { before: 200}}),
                                ...resume.education.map(
                                    (edu) =>
                                        new Paragraph({
                                            text: `${edu.degree}, ${edu.school} (${edu.year})`,
                                            bullet: { level: 0 },
                                        })
                                ),
                            ]
                            :[]
                        ),
                        ...(resume.skills?.length
                            ? [
                                new Paragraph({ text: "Skills:", spacing: { before: 200 }}),
                                new Paragraph({ text: resume.skills.join(", ")}),
                            ]
                        :[]),
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename= "${resume.fullName}.docx"`
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document."
        );
        res.send(buffer);
    } catch(error: any) {
        console.error("Error generating DOCX:", error);
        res.status(500).json({ message: "Error generating DOCX", error: error.message});
        return;
    }
};

export const generateCoverLetter = async (req: Request, res: Response): Promise<void> => {
    try{
        const resume = await Resume.findById(req.params.id);
        const { jobDescription } = req.body;
        if (!resume || !jobDescription ) {
            res.status(400).json({ message: "Missing resume or Job description" });
            return;
        }


        const promptText = `
        you are a professional career coach.
        Write a compelling cover letter for a candidate with the following resume:
        Name: ${resume.fullName}
        Summary: ${resume.summary || "N/A"}
        Experience: ${resume.experience?.map(e => `${e.role} at ${e.company} (${e.duration})`).join("; ") || "N/A"}
        Education: ${resume.education?.map(e => `${e.degree} from ${e.school} (${e.year})`).join("; ") || "N/A"}
        Skills: ${resume.skills?.join(", ") || "N/A"}
        Job Description: ${jobDescription}
        The cover letter should be concise (3-4 paragraphs), professional, and tailored to the job.
        `;


        const result = await textModel.generateContent({
            model: "gemini-2.0-flash-001",
            contents: [{ role: "user", parts: [{ text: promptText}]}],
        });

        const candidate = result.candidates?.[0];
        if (!candidate) {
            res.status(500).json({ message: "No response from model."});
            return;
        }
        const aiText = candidate.content?.parts?.[0]?.text?.trim() || "";
        
        res.status(200).json({ coverLetter: aiText});
        return;
    } catch (error: any) {
        console.error("Error generating cover letter:", error);
        res.status(500).json({ message: "Error generating cover letter", error: error.message });
        return;
    }
};

export const enhancedOptimization = async (req: Request,res: Response ): Promise<void> => {
    try{
        const resumeId = req.params.id;
        const { jobDescription } = req.body;
        if ( !jobDescription ) {
            res.status(400).json({ message: "Job description is required" });
            return;
        }

        const resume = await Resume.findById(resumeId);
        if (!resume ) {
            res.status(400).json({ message: "Resume not found" });
            return;
        }
        
        const promptText = `
        you are an expert resume reviewer.
        Rate the resume on a scale of 1-10 for this job, then list 3-5 bullet suggestions to improve match.

        Resume:
        Name: ${resume.fullName}
        Summary: ${resume.summary || "N/A"}
        Experience: ${resume.experience?.map(e => `${e.role} at ${e.company} (${e.duration})`).join("; ") || "N/A"}
        Education: ${resume.education?.map(e => `${e.degree} from ${e.school} (${e.year})`).join("; ") || "N/A"}
        Skills: ${resume.skills?.join(", ") || "N/A"}
        Job Description: ${jobDescription}
        Respond in JSON with keys:
        - score: number
        - suggestions: string[]
        - rationale: string
        `;

        
        const result = await textModel.generateContent({
            model: "gemini-2.0-flash-001",
            contents: [{ role: "user", parts: [{ text: promptText}]}],
        });

        const candidate = result.candidates?.[0];
        if (
            !candidate ||
            !candidate.content ||
            !candidate.content.parts ||
            // !candidate.content.parts.length === 0 ||
            !candidate.content.parts[0].text

        ) {
            res.status(500).json({ message: "No response from model."});
            return;
        }
        const raw = candidate.content.parts[0].text.trim();
        let optimization;
        try{
            optimization = JSON.parse(raw);
        } catch {
            optimization = {raw};
        }
        res.status(200).json({ optimization});
        return;
    } catch (error: any) {
        console.error("Error in enhancing optimization:", error);
        res.status(500).json({ message: "Error optimizing resume", error: error.message });
        return;
    }
};