import type { APIRequest, APIResponse } from '../types';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function callAIAPI(multiChoiceQuestion: string): Promise<APIResponse> {
  const requestBody: APIRequest = {
    user_question: multiChoiceQuestion,
    case_id: '',
    settings_file_name: 'Ryan 01 July v.4'
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.text();
    
    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(data);
      
      // If the response is already in the expected format
      if (jsonResponse.ANSWER && jsonResponse.SHORT_EXPLANATION) {
        return jsonResponse;
      }
      
      // If the response contains JSON within a text field
      if (typeof jsonResponse === 'string') {
        const innerJson = JSON.parse(jsonResponse);
        if (innerJson.ANSWER && innerJson.SHORT_EXPLANATION) {
          return innerJson;
        }
      }
      
      // If the response is in a different format, try to extract it
      if (jsonResponse.response || jsonResponse.result) {
        const content = jsonResponse.response || jsonResponse.result;
        if (typeof content === 'string') {
          const match = content.match(/\{[^}]*"ANSWER"[^}]*\}/);
          if (match) {
            return JSON.parse(match[0]);
          }
        }
      }
      
      throw new Error('Unexpected response format');
    } catch {
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch = data.match(/\{[^}]*"ANSWER"[^}]*"SHORT_EXPLANATION"[^}]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return a default response
      console.error('Failed to parse API response:', data);
      return {
        ANSWER: 'ERROR',
        "SHORT EXPLANATION": 'Failed to parse API response'
      };
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export function calculateScore(correctLetter: string, modelAnswer: APIResponse): number {
  return correctLetter === modelAnswer.ANSWER ? 1 : 0;
}
