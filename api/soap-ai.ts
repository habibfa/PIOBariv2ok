import dotenv from "dotenv";
import { generateClinicalSoapFallback } from "../src/utils/clinicalAssistantFallback.ts";
import {
  getAIClient,
  callGeminiAdaptive,
  SOAP_SYSTEM_INSTRUCTION,
  buildSoapPrompt
} from "../src/utils/aiPrompts.ts";

dotenv.config();

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const rawPatientData = req.body?.patientData;
    const patientData = typeof rawPatientData === "string" ? rawPatientData.trim().slice(0, 8000) : "";

    if (!patientData) {
      return res.status(400).json({ error: "Data pasien diperlukan." });
    }

    const ai = getAIClient(req);
    if (!ai) {
      return res.status(200).json({ text: generateClinicalSoapFallback(patientData) });
    }

    const prompt = buildSoapPrompt(patientData);

    try {
      const responseText = await callGeminiAdaptive(ai, prompt, {
        systemInstruction: SOAP_SYSTEM_INSTRUCTION,
        maxTotalTimeMs: 8500,
        maxOutputTokens: 1500,
        temperature: 0.2,
        tag: "Vercel soap-ai"
      });
      return res.status(200).json({ text: responseText });
    } catch (geminiError: any) {
      console.warn("[Vercel soap-ai] Gemini failed, using high-fidelity fallback:", geminiError?.message);
      return res.status(200).json({ text: generateClinicalSoapFallback(patientData) });
    }
  } catch (err: any) {
    console.error("[Vercel soap-ai] Unexpected error:", err);
    return res.status(200).json({ text: generateClinicalSoapFallback(req.body?.patientData || "") });
  }
}
