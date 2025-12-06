// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ SECURITY RISK: This key is exposed to the client
const GEMINI_API_KEY = "AIzaSyDQlPkfBd5X-Aiwmgi97yRcZyUBxUZ2GNU"; 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper: Convert File to Base64 for Gemini
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the "data:*/*;base64," prefix
      const base64 = result.split(',')[1]; 
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeFile = async (file: File, type: 'audio' | 'photo' | 'text') => {
  try {
    let prompt = "";
    
    // Updated Style Guide: Strict "No Name" Policy
    const styleGuide = `
      CRITICAL STYLE RULES:
      1. **NO PROPER NAMES**: Never use names (e.g., "Michael", "Jackson", "Ah Kow"). Refer to the subject ONLY as "He".
      2. **Title**: Max 3-4 words. Use concrete objects or abstract nouns (e.g., "The Voice Tape", "Studio Session", "The Red Jacket"). 
      3. **Description**: Max 10-15 words. Nostalgic, moody, poetic. Use sentence fragments. 
      4. **Subject**: The subject is male. Always use "He/Him/His".
      
      Examples:
      - BAD: "Michael singing Billie Jean."
      - GOOD: "The Studio Take" -> "He poured his soul into every note."
      - BAD: "Jackson's glove."
      - GOOD: "The Sequined Glove" -> "It sparkled under the stage lights."
    `;

    // 1. Define Prompts based on type
    if (type === 'audio') {
      prompt = `
        Role: Memoir Archivist. 
        Task: Listen to the audio. Identify the emotion and context.
        ${styleGuide}
        
        Output strictly valid JSON (no markdown):
        { 
          "title": "Short concrete title", 
          "description": "Evocative summary using 'He'...", 
          "text_content": "Full verbatim transcription" 
        }
      `;
    } else if (type === 'photo') {
      prompt = `
        Role: Memoir Archivist.
        Task: Analyze the image mood, lighting, and action.
        ${styleGuide}

        Output strictly valid JSON (no markdown):
        { 
          "title": "Short concrete title", 
          "description": "Evocative summary using 'He'...", 
          "text_content": "" 
        }
      `;
    } else if (type === 'text') {
      prompt = `
        Role: Memoir Archivist.
        Task: Read the text to understand the story or memory.
        ${styleGuide}

        Output strictly valid JSON (no markdown):
        { 
          "title": "Short concrete title", 
          "description": "Evocative summary using 'He'...", 
          "text_content": "Cleaned summary of the text" 
        }
      `;
    }

    // 2. Prepare Payload
    let parts: any[] = [];
    
    if (type === 'text') {
      const textContent = await file.text();
      // Truncate text to avoid token limits if necessary, though 1.5 Flash has a large context
      parts = [{ text: `${prompt}\n\nInput Text Content:\n${textContent.substring(0, 25000)}` }];
    } else {
      const base64Data = await fileToBase64(file);
      parts = [
        { text: prompt },
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        }
      ];
    }

    // 3. Call API
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    // 4. Clean JSON (remove markdown code blocks if present)
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};