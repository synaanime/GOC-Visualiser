import { GoogleGenAI, Type } from "@google/genai";
import { EducationLevel, ChemicalData, WebSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

export const analyzeChemicalStructure = async (
  imageData: string | null,
  textInput: string | null,
  level: EducationLevel
): Promise<ChemicalData> => {
  if (!imageData && !textInput) {
    throw new Error("Please provide a drawing or chemical name.");
  }

  const parts: any[] = [];

  // Add Image part if exists (base64)
  if (imageData) {
    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    // Note: If using JPEG from canvas, the mimeType should match
    const mimeType = imageData.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
    
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  // Add Text Prompt part
  let promptText = `
    Act as a highly experienced Chemistry teacher in the Indian Education System.
    Identify the chemical compound from the ${imageData ? "image" : "name provided below"}.
    
    Target Audience Level: ${level}
    
    Provide a structured response containing:
    1. Common Name
    2. IUPAC Name
    3. Molecular Formula
    4. A summary explanation tailored specifically to the knowledge level of a student in ${level}.
       - For Foundation: Keep it simple, focus on daily life uses and basic atoms.
       - For Board Level: Focus on standard properties, hybridization, and textbook definitions.
       - For JEE/NEET: Focus on stability, reaction mechanisms, exceptions, electronic effects (resonance/inductive), and competitive exam trivia.
       - For Undergraduate: Discuss molecular orbital theory, spectroscopic properties, and advanced synthesis.
    5. Key Properties/Facts (3-5 bullet points relevant to the level).
    6. Common Reactions or Uses (relevant to the level).
    7. Curriculum Context: A specific note on why this is important for this specific curriculum level (e.g., "Frequent question in JEE regarding acidity order").
    8. Real World Analogy: A creative, non-chemistry analogy to help understand the molecule's behavior or structure (e.g., "Think of Benzene like a round table where everyone shares their food equally...").
    9. Fun Facts: 3 interesting, quirky, or historical facts about this chemical.
  `;

  if (textInput) {
    promptText += `\n\nChemical Name/Query: ${textInput}`;
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        // Removed googleSearch tool to improve response speed
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Common Name" },
            iupacName: { type: Type.STRING, description: "IUPAC Name" },
            molecularFormula: { type: Type.STRING, description: "Molecular Formula (e.g., C6H6)" },
            summary: { type: Type.STRING, description: "Educational summary tailored to the level" },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of key properties or facts"
            },
            reactions_or_uses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of reactions or uses"
            },
            curriculumContext: { type: Type.STRING, description: "Context specific to the Indian exam curriculum selected" },
            analogy: { type: Type.STRING, description: "A simple real-world analogy for the concept" },
            funFacts: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of fun or historical facts"
            }
          },
          required: ["name", "iupacName", "molecularFormula", "summary", "keyPoints", "reactions_or_uses", "curriculumContext", "analogy", "funFacts"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response received from AI model.");
    }

    let parsedData: ChemicalData;
    try {
        parsedData = JSON.parse(response.text) as ChemicalData;
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, response.text);
        throw new Error("Failed to structure the chemical data. The AI response was malformed.");
    }
    
    // WebSources are removed as per previous request to hide references and to speed up processing

    return parsedData;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    let message = "An unexpected error occurred.";
    const errString = error.message || error.toString();

    // Categorize common errors
    if (errString.includes("API key") || errString.includes("401")) {
      message = "Authentication Failed: Please check your API key configuration.";
    } else if (errString.includes("403")) {
      message = "Access Denied: The API key cannot access this model or region.";
    } else if (errString.includes("429")) {
      message = "High Traffic: The service is currently busy. Please try again in a few seconds.";
    } else if (errString.includes("fetch failed") || errString.includes("network")) {
      message = "Network Error: Please check your internet connection.";
    } else if (errString.includes("Safety") || errString.includes("blocked")) {
      message = "Content Warning: The input was flagged by safety filters. Try a different drawing.";
    } else if (errString.includes("JSON") || errString.includes("structure")) {
       message = "Data Error: Could not interpret the AI's response. Please try again.";
    } else {
        message = errString;
    }
    
    throw new Error(message);
  }
};