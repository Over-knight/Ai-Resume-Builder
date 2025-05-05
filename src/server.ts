import dotenv from "dotenv";
dotenv.config();
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { VertexAI } from "@google-cloud/vertexai";
// import bodyParser from "body-parser";
import mongoose from "mongoose";
import morgan from "morgan";
// import connectDB from "./config/db";
import resumeRoutes from "./routes/resumeRoutes";
import authRoutes from "./routes/authRoutes";
import express from "express";
import http from "http";
import {Server as SocketIOServer, Socket} from "socket.io";
// import { textModel } from "./lib/genaiClient";


import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

const app = express();
app.use(morgan("tiny"));


// app.use((req, res, next) => {
//     console.log(`Received ${req.method} request for ${req.url}`);
//     next();
//   });
//   app.get("/test", (req, res) => {
//     res.send("Test route works!");
//   });
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(", ") || "*",
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    credentials: true,
  })
);
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
export default app;
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    methods: ["GET","POST"]
  }
});
io.on("connection", socket => {
  console.log(`⚡️ Socket connected: ${socket.id}`);

  // join a “room” for a given resume ID
  socket.on("joinResume", (resumeId: string) => {
    socket.join(resumeId);
    console.log(`${socket.id} joined room ${resumeId}`);
  });

  // broadcast updates to everyone else in that room
  socket.on("resumeUpdated", (data: { resumeId: string, changes: any }) => {
    socket.to(data.resumeId).emit("resumeChange", data.changes);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
// Ensure MongoDB URI exists
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("⚠️ MONGO_URI is not defined in .env file!");
  process.exit(1);
}

// if (require.main === module) {

// }
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

