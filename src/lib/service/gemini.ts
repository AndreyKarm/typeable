import { GoogleGenAI } from "@google/genai";
import { env } from '$env/dynamic/private';
import type { Mistake } from "./TMistake";

if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function generateCustomExercise(mistakes: Mistake[]) {
  // Convert error object to a readable string for the AI
  const aggregatedErrors = aggregateErrors(mistakes);

  const systemInstruction = `
    You are a professional typing tutor. 
    Your goal is to generate a short, coherent English paragraph (approx 30-40 words) 
    designed to help a user practice specific keys they keep failing at.
    
    The user's top errors are: ${aggregatedErrors}.
    
    Rules:
    1. Incorporate the problematic characters frequently in the text.
    2. Do not write intros like "Here is your exercise:". 
    3. Only return the raw text of the exercise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Generate a new typing exercise based on these errors.",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slightly creative to keep text natural
      }
    });

    // Clean the output just in case
    return response.text?.trim().replace('—', ' - ').replace('*', '') || "The quick brown fox jumps over the lazy dog.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "The quick brown fox jumps over the lazy dog."; // Fallback
  }
}

// Aggregate mistakes by character
function aggregateErrors(mistakes: Mistake[]) {
  // Count the number of mistakes for each character
  const counts: Record<string, number> = {};

  // Iterate over the mistakes and count the number of mistakes for each character
  mistakes.forEach((m) => {
    const key = m.char;
    counts[key] = (counts[key] || 0) + 1;
  });

  // Sort the characters by count and return the top 5 sorted characters
  const sortedErrors = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([char, count]) => `${char} (${count} errors)`)
    .join(', ');

  // If there are no mistakes, return "none (general practice)"
  return sortedErrors.length > 0 ? sortedErrors : "none (general practice)";
}