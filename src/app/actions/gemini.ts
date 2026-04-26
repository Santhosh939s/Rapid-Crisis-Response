"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Incident } from "@/lib/types";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateResponsePlan(incident: Incident): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are a crisis response coordinator for a hotel. An incident has occurred:
- Type: ${incident.type}
- Room/Location: ${incident.roomNumber} (Floor: ${incident.floor})
- Severity: ${incident.severity}
- Guest Description: ${incident.guestDescription || "None provided"}

Generate a numbered, prioritized 5-step response plan for hotel staff. Be concise and actionable.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to generate response plan.");
  }
}

export async function generateGuestAnnouncement(incident: Incident): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Write a calm, reassuring announcement for hotel guests about a ${incident.type} incident without causing panic.
Keep it under 50 words. Do not mention the exact severity level if it's critical, just that staff are handling it.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to generate announcement.");
  }
}

export async function generateLessonsLearned(timeline: any[]): Promise<string[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const timelineString = timeline.map(t => `- ${new Date(t.timestamp).toLocaleTimeString()}: ${t.action}`).join("\n");

  const prompt = `
Write a formal post-incident report analysis based on this timeline:
${timelineString}

Extract exactly 3 distinct improvement recommendations or lessons learned.
Format the output strictly as a JSON array of strings. Do not use markdown blocks. Example: ["lesson 1", "lesson 2", "lesson 3"]
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to generate lessons learned.");
  }
}
