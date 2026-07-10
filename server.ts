import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini on the server side securely
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. AI Chat Dispatcher / Emergency Assistant Chatbot
app.post("/api/autorescue/chat", async (req, res) => {
  try {
    const { messages } = req.body; // array of {role, content}
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Missing or invalid messages array." });
      return;
    }

    const ai = getAiClient();
    
    const systemPrompt = `You are AutoRescue AI, an advanced emergency roadside dispatch assistant in Uganda.
Your job is to stay calm, reassure the motorist/victim, ask helpful diagnostic questions about their vehicle, and recommend immediate safety steps (e.g., placing a warning triangle 50m behind, steering to the hard shoulder on the Entebbe Expressway, turning on hazard lights, etc.).
Keep your responses action-oriented, professional, empathetic, and culturally aware of Ugandan driving environments (e.g., Kampala potholes, traffic jam spots, mobile money payments like MTN and Airtel).
Keep answers relatively concise (1-3 paragraphs) so they are easy to read on mobile screens under stress.`;

    const formattedContents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
    });

    res.json({ text: response.text || "I am processing your location now. Please stay safe." });
  } catch (error: any) {
    console.error("AutoRescue Chat Error:", error);
    res.status(500).json({ 
      error: "Failed to load AutoRescue AI response.",
      details: error?.message || String(error)
    });
  }
});

// 2. AI Accident / Mechanical Breakdown Severity Estimator
app.post("/api/autorescue/accident-estimate", async (req, res) => {
  try {
    const { description, serviceType, userLocation } = req.body;
    if (!description) {
      res.status(400).json({ error: "Missing breakdown description." });
      return;
    }

    const ai = getAiClient();
    
    const systemPrompt = `You are the AutoRescue AI Triage Engine.
Analyze the description of a roadside breakdown or accident in Uganda:
- Service type: ${serviceType || "Unknown"}
- Location: ${userLocation || "Kampala"}
- Breakdown/Accident text: "${description}"

Determine:
1. Severity Category: "Low" (e.g. flat battery, car lock), "Medium" (flat tire, minor radiator leak), "High" (heavy smoking engine, brakes failed on slope), or "Critical" (major collision, car overturned, medical trauma required).
2. Estimated repair cost range in Ugandan Shillings (UGX).
3. Required service provider type and necessary special equipment (e.g., flatbed tow with wheel dollies, heavy crane, paramedic team).
4. Immediate safety checklist for the motorist to perform while waiting.
5. AI Predictive Warning (e.g., potential blockages on Ugandan highways, high risk of battery drain, etc.).

Return the response strictly as a JSON object with:
{
  "severity": "Low" | "Medium" | "High" | "Critical",
  "costMin": number,
  "costMax": number,
  "requiredEquipment": string[],
  "safetySteps": string[],
  "predictiveAlert": string
}
Do NOT include any markdown code blocks, backticks, or text before/after the JSON. Just return the JSON itself.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [systemPrompt],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    const cleanJson = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json(cleanJson);
  } catch (error: any) {
    console.error("Accident Severity AI Triage Error:", error);
    res.status(500).json({ 
      error: "AI Triage failed. Reverting to manual dispatch.",
      details: error?.message || String(error)
    });
  }
});

// 3. AI Smart Route Optimization, Provider Search & Fraud Prevention
app.post("/api/autorescue/optimize-route", async (req, res) => {
  try {
    const { requestDetails, availableProviders } = req.body;
    
    const ai = getAiClient();
    
    const systemPrompt = `You are the AutoRescue AI Route & Provider Dispatch Optimizer.
Analyze the requested service: ${JSON.stringify(requestDetails)}
And the current location of available providers: ${JSON.stringify(availableProviders)}

Based on Ugandan traffic conditions (Kampala jams, Entebbe Expressway speed limits, road closures, peak hour bottlenecks), determine:
1. The absolute best provider to assign (by ID).
2. Expected fastest route recommendation (e.g. bypassing Acacia Avenue via Wandegeya).
3. The precise AI-estimated time of arrival (ETA) in minutes.
4. Estimated travel distance in kilometers.
5. AI Fraud Risk Assessment (assess if the request is high risk for fraudulent billing, towing overcharging, or unrealistic distance claims).

Return the response strictly as a JSON object with:
{
  "recommendedProviderId": string,
  "recommendedRoute": string,
  "etaMinutes": number,
  "distanceKm": number,
  "fraudRiskLevel": "Low" | "Medium" | "High",
  "fraudAssessmentJustification": string
}
Do NOT include any markdown code blocks or text before/after the JSON. Just return the JSON itself.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [systemPrompt],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    const cleanJson = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json(cleanJson);
  } catch (error: any) {
    console.error("AI Dispatch Routing Error:", error);
    res.status(500).json({
      error: "Failed to optimize route with AI.",
      details: error?.message || String(error)
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoRescue server running on http://localhost:${PORT}`);
  });
}

startServer();
