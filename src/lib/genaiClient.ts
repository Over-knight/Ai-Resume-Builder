import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("Missing Google API KEY in environment");
} 

const genAI = new GoogleGenAI({ apiKey });
export const textModel = genAI.models;

