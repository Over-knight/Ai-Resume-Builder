import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VertexAI } from "@google-cloud/vertexai";
import bodyParser from "body-parser";
import mongoose from "mongoose";
// import connectDB from "./config/db";
import resumeRoutes from "./routes/resumeRoutes";
import authRoutes from "./routes/authRoutes";
import express from "express";
import { textModel } from "./lib/genaiClient";


import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

const app = express();



// app.use((req, res, next) => {
//     console.log(`Received ${req.method} request for ${req.url}`);
//     next();
//   });
//   app.get("/test", (req, res) => {
//     res.send("Test route works!");
//   });
//MIddleware
app.use(express.json({ limit: "10kb"}));
app.use(mongoSanitize());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many auth attempts, please try again later.",
});
app.use("/api/auth", authLimiter);


const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: "Too many AI requests - slow down a bit.",
});
app.use("/api/resumes/:id/cover-letter", aiLimiter);
app.use("/api/resumes/:id/optimize", aiLimiter);

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);

app.use((req, res) => {
    res.status(404).send("Not Found");
});

const PORT = process.env.PORT || 4000;
// Ensure MongoDB URI exists
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("⚠️ MONGO_URI is not defined in .env file!");
  process.exit(1);
}


// MongoDB Connection
(async () => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    } as mongoose.ConnectOptions);
    console.log("Successfully connected to MongoDB!");

    // Start the server only after MongoDB connection is successful
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
})();
// const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// const result = await textModel.generateContent({ })