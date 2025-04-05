import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
// import connectDB from "./config/db";
import resumeRoutes from "./routes/resumeRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();



// app.use((req, res, next) => {
//     console.log(`Received ${req.method} request for ${req.url}`);
//     next();
//   });
//   app.get("/test", (req, res) => {
//     res.send("Test route works!");
//   });
//MIddleware
app.use(express.json());

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