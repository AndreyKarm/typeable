import { LMStudioClient } from "@lmstudio/sdk";
import type { Mistake } from "./TMistake";

const client = new LMStudioClient();

export async function generateCustomExercise(mistakes: Mistake[]) {

  console.log("New request!")

  const aggregatedErrors = aggregateErrors(mistakes);

  try {
    const model = await client.llm.model("mistralai/ministral-3-3b");

    const messages = [
      {
        role: "system",
        content: `
        You are a professional typing tutor. 
        Your goal is to generate a short, coherent English paragraph (approx 30-40 words) 
        designed to help a user practice specific keys they keep failing at.
        
        The user's top errors are: ${aggregatedErrors}.
        
        Rules:
        1. Incorporate the problematic characters frequently in the text.
        2. Do not write intros like "Here is your exercise:". 
        3. Only return the raw text of the exercise.`
      },
      {
        role: "user",
        content: "Generate a new typing exercise based on these errors."
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any;

    const prediction = await model.respond(messages, {
      temperature: 0.7,
    });

    const cleaned = prediction.content
      .replace(/\*\*/g, '')    // Remove bold (**)
      .replace(/\*/g, '')      // Remove italics (*)
      .replace(/—/g, ' - ')     // Replace em-dash (—) with a standard hyphen
      .replace(/’/g, "'")     // Replace (’) with (')
      .replace(/\s+/g, ' ')    // Clean up multiple spaces
      .trim();

    return cleaned || "The quick brown fox jumps over the lazy dog.";

  } catch (error) {
    console.error("LM Studio Generation Error (Ensure LM Studio is running!):", error);
    // Fallback: If local LLM isn't running or crashes
    return generateHeuristicExercise(aggregatedErrors);
  }
}

function generateHeuristicExercise(errors: string) {
  const pool = errors.length > 0 ? errors.replace(/,/g, '') : "etaoinshrdlcumwfgypbvkjxqz";
  let result = "";
  for (let i = 0; i < 30; i++) {
    result += pool[Math.floor(Math.random() * pool.length)] + " ";
  }
  return `Practice these keys: ${result.trim()}. Focus on your accuracy and rhythm.`;
}

function aggregateErrors(mistakes: Mistake[]) {
  const counts: Record<string, number> = {};

  mistakes.forEach((m) => {
    const key = m.char;
    counts[key] = (counts[key] || 0) + 1;
  });

  const sortedErrors = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([char, count]) => `${char} (${count} errors)`)
    .join(', ');

  return sortedErrors.length > 0 ? sortedErrors : "none (general practice)";
}