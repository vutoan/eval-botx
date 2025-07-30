export interface QuestionData {
  category: string;
  question: string;
  human_answer: string;
  correct_answer: string;
  multiple_choice: string[];
  multi_choice_question: string;
  correct_letter: string;
  test: TestResult[];
  score: number;
}

export interface TestResult {
  multi_choice_question: string;
  correct_letter: string;
  model_answer_letter: string;
  model_answer: string;
  score: number;
}

export interface ParsedQuestion {
  category: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface APIRequest {
  user_question: string;
  case_id: string;
  settings_file_name: string;
}

export interface APIResponse {
  ANSWER: string;
  "SHORT EXPLANATION": string;
}

export interface QuestionsCollection {
  [key: string]: QuestionData;
}
