import { GoogleGenAI, Type } from "@google/genai";
import { Patient, Room } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeClinicStatus(patients: Patient[], rooms: Room[]) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the current status of a dental clinic and provide actionable insights.
    
    Current Rooms: ${JSON.stringify(rooms)}
    Current Patients: ${JSON.stringify(patients)}
    
    Provide insights in JSON format:
    {
      "summary": "Overall clinic status summary",
      "alerts": [
        { "type": "warning" | "info" | "success", "message": "Alert message", "patientId": "optional id" }
      ],
      "recommendations": ["Actionable step 1", "Actionable step 2"],
      "efficiencyScore": 0-100
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          alerts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                message: { type: Type.STRING },
                patientId: { type: Type.STRING }
              }
            }
          },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          efficiencyScore: { type: Type.NUMBER }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generatePatientSummary(patient: Patient) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Generate a concise clinical summary for this dental patient based on their logs and notes.
    
    Patient: ${JSON.stringify(patient)}
    
    The summary should be professional and highlight key events.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}
