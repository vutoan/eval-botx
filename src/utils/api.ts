import type { APIRequest, APIResponse } from "../types";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function callAIAPI(
  multiChoiceQuestion: string
): Promise<APIResponse> {
  const requestBody: APIRequest = {
    messages: [
      {
        role: "user",
        content: multiChoiceQuestion,
      },
    ],
    org_id: "346bbebb-f652-4a25-a1e4-0d5c09373881",
    stream: false,
    settings_file: "Ryan - 32Coach v.2",
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data: { text: string } = await response.json();
    // Try to parse the response as JSON
    try {
      const jsonResponse = parseFencedApiResponse(data.text);

      // If the response is already in the expected format
      if (jsonResponse.ANSWER && jsonResponse["SHORT EXPLANATION"]) {
        return jsonResponse;
      }

      // If the response contains JSON within a text field
      if (typeof jsonResponse === "string") {
        const innerJson = JSON.parse(jsonResponse);
        if (innerJson.ANSWER && innerJson.SHORT_EXPLANATION) {
          return innerJson;
        }
      }

      throw new Error("Unexpected response format");
    } catch {
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch = data.text.match(
        /\{[^}]*"ANSWER"[^}]*"SHORT_EXPLANATION"[^}]*\}/
      );
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: return a default response
      console.error("Failed to parse API response:", data);
      return {
        ANSWER: "ERROR",
        "SHORT EXPLANATION": "Failed to parse API response",
      };
    }
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

export function calculateScore(
  correctLetter: string,
  modelAnswer: APIResponse
): number {
  return correctLetter === modelAnswer.ANSWER ? 1 : 0;
}

// Parse a string that may contain a ```json fenced block into an APIResponse
export function parseFencedApiResponse(input: string): APIResponse {
  const trimmed = input.trim();
  const fenceMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(trimmed);
  const payload = fenceMatch ? fenceMatch[1] : trimmed;

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error("Invalid JSON in code fence or input");
  }

  // Normalize into APIResponse
  const rec = parsed as Record<string, unknown>;
  const rawAns = (rec.ANSWER ?? rec["answer"]) as unknown;
  const rawExp = (rec["SHORT EXPLANATION"] ??
    rec["SHORT_EXPLANATION"] ??
    rec["short_explanation"]) as unknown;

  if (typeof rawAns !== "string") throw new Error("Missing ANSWER field");
  if (typeof rawExp !== "string")
    throw new Error("Missing SHORT EXPLANATION field");

  const upper = rawAns.trim().toUpperCase();
  const letter = upper.match(/[A-E]/)?.[0] ?? upper;

  return { ANSWER: letter, "SHORT EXPLANATION": rawExp };
}
