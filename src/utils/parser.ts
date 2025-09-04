import type { ParsedQuestion, QuestionData, QuestionsCollection } from '../types';
import * as XLSX from 'xlsx';

export async function parseXlsxFile(file: File): Promise<ParsedQuestion[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const sheet = workbook.Sheets[firstSheetName];
  // Read as 2D array; header:1 returns rows with cell values
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  if (!rawRows || rawRows.length <= 1) return [];
  const rows = rawRows.filter(row => row.length > 0);
  const parsed: ParsedQuestion[] = [];
  // Skip the first row (header)
  for (let r = 1; r < rows.length; r++) {
    const row = (rows[r] ?? []) as unknown[];
    // Expect 7 columns: category, question, option A (correct), option B, option C, option D, option E
    const [category, question, optA, optB, optC, optD, optE] = row;
    const toStr = (v: unknown) => (v === null || v === undefined ? '' : String(v)).trim();
    const options = [optA, optB, optC, optD, optE].map(toStr);
  const categoryStr = toStr(category);
  const questionStr = toStr(question);

    if (!categoryStr || !questionStr || options.some(o => !o)) {
      // Skip incomplete rows
      continue;
    }

  // Third column is Option A and is the correct answer; answer letter is always 'A'
    parsed.push({
      category: categoryStr,
      question: questionStr,
      options,
      answer: 'A',
      explanation: ''
    });
  }

  return parsed;
}

export function parseTextFile(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const sections = content.split(/\r\n------\r\n/).filter(section => section.trim());
  console.log('Parsing sections:', sections);
  let currentQuestion: Partial<ParsedQuestion> = {};
  
  for (const section of sections) {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === 'Category:') {
        if (Object.keys(currentQuestion).length > 0) {
          console.log('Incomplete question found, skipping:', currentQuestion);
          if (isCompleteQuestion(currentQuestion)) {
            questions.push(currentQuestion as ParsedQuestion);
          }
          currentQuestion = {};
        }
        // Get the category from the next line
        if (i + 1 < lines.length) {
          currentQuestion.category = lines[i + 1].trim();
        }
      } else if (line === 'Question:') {
        // Get the question from the next line
        if (i + 1 < lines.length) {
          currentQuestion.question = lines[i + 1].trim();
        }
      } else if (line === 'Options:') {
        currentQuestion.options = [];
      } else if (/^[A-D]\.\s/.test(line) && currentQuestion.options) {
        const optionText = line.substring(3).trim();
        currentQuestion.options.push(optionText);
      } else if (line === 'Answer:') {
        // Get the answer from the next line
        if (i + 1 < lines.length) {
          currentQuestion.answer = lines[i + 1].trim();
        }
      } else if (line === 'Explanation:') {
        // Get all remaining lines as the explanation
        if (i + 1 < lines.length) {
          const remainingLines = lines.slice(i + 1);
          currentQuestion.explanation = remainingLines.join(' ').trim();
        }
      }
    }
  }
  console.log('Parsed questions:', currentQuestion);
  // Add the last question if it's complete
  if (isCompleteQuestion(currentQuestion)) {
    questions.push(currentQuestion as ParsedQuestion);
  }
  
  return questions;
}

function isCompleteQuestion(question: Partial<ParsedQuestion>): boolean {
  return !!(
    question.category &&
    question.question &&
    question.options &&
    (question.options.length === 4 || question.options.length === 5) &&
    question.answer &&
    question.explanation
  );
}

export function convertToQuestionData(parsedQuestions: ParsedQuestion[]): QuestionsCollection {
  const collection: QuestionsCollection = {};
  
  parsedQuestions.forEach((parsed, index) => {
    const questionId = (index + 1).toString();
    
    // Find the correct answer text
    const answerLetter = parsed.answer.toUpperCase();
    const answerIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
    const correctAnswer = parsed.options[answerIndex] || '';
    
    // Generate the multi-choice question format
    const multiChoiceQuestion = generateMultiChoiceQuestion(parsed.question, parsed.options);
    
    collection[questionId] = {
      category: parsed.category,
      question: parsed.question,
      human_answer: parsed.explanation,
      correct_answer: correctAnswer,
      multiple_choice: [...parsed.options],
      multi_choice_question: multiChoiceQuestion,
      correct_letter: answerLetter,
      test: [],
      score: 0
    };
  });
  
  return collection;
}

function generateMultiChoiceQuestion(question: string, options: string[]): string {
  const optionsText = options
    .map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`)
    .join('\n');
  
  return `<MULTIPLE CHOICE QUESTION>
${question}

<POSSIBLE ANSWERS>
${optionsText}

<TASK>
Select a single choice letter from the ANSWERS that answer the QUESTION. You should also provide a short explanation (< 100 words). Return your response in a single JSON object, Do not wrap the json codes in JSON markers:
{"ANSWER": "B", "SHORT EXPLANATION": "..."}.`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateTestVariants(questionData: QuestionData, numVariants: number = 4): {
  multiChoiceQuestion: string;
  correctLetter: string;
}[] {
  const variants = [];
  const originalOptions = [...questionData.multiple_choice];
  const originalCorrectAnswer = questionData.correct_answer;
  
  for (let i = 0; i < numVariants; i++) {
    const shuffledOptions = shuffleArray(originalOptions);
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectAnswer);
    const newCorrectLetter = String.fromCharCode(65 + newCorrectIndex); // A, B, C, D
    
    const multiChoiceQuestion = generateMultiChoiceQuestion(questionData.question, shuffledOptions);
    
    variants.push({
      multiChoiceQuestion,
      correctLetter: newCorrectLetter
    });
  }
  
  return variants;
}
