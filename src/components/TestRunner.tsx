import { useState, useEffect, useRef } from 'react';
import { generateTestVariants } from '../utils/parser';
import { callAIAPI, calculateScore } from '../utils/api';
import type { QuestionsCollection, TestResult } from '../types';

interface TestRunnerProps {
  questions: QuestionsCollection;
  onTestingComplete: (updatedQuestions: QuestionsCollection) => void;
}

function TestRunner({ questions, onTestingComplete }: TestRunnerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [updatedQuestions, setUpdatedQuestions] = useState<QuestionsCollection>(questions);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const questionEntries = Object.entries(questions);
  const totalTests = questionEntries.length * 4; // 4 variants per question

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const runTestsAsync = async () => {
      const updated = { ...updatedQuestions };
      
      for (let qIndex = 0; qIndex < questionEntries.length; qIndex++) {
        const [questionId, questionData] = questionEntries[qIndex];
        setCurrentQuestionIndex(qIndex);
        setCurrentTest(`Testing Question ${parseInt(questionId)}: ${questionData.question.substring(0, 50)}...`);
        
        addLog(`Starting tests for Question ${questionId}`);
        
        // Generate 4 variants for this question
        const variants = generateTestVariants(questionData, 4);
        console.log('Generated variants:', variants);
        
        addLog(`Running 4 variants in parallel for Question ${questionId}`);
        
        // Run all variants in parallel
        const variantPromises = variants.map(async (variant, vIndex) => {
          try {
            addLog(`Starting variant ${vIndex + 1}/4 for Question ${questionId}`);
            
            // Call the AI API
            const apiResponse = await callAIAPI(variant.multiChoiceQuestion);
            
            // Calculate score
            const score = calculateScore(variant.correctLetter, apiResponse);
            
            // Create test result
            const testResult: TestResult = {
              multi_choice_question: variant.multiChoiceQuestion,
              correct_letter: variant.correctLetter,
              model_answer_letter: apiResponse.ANSWER,
              model_answer: apiResponse['SHORT EXPLANATION'],
              score
            };
            
            addLog(`Variant ${vIndex + 1} completed. Score: ${score} (Correct: ${variant.correctLetter}, AI: ${apiResponse.ANSWER})`);
            
            return testResult;
            
          } catch (error) {
            addLog(`Error testing variant ${vIndex + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            
            // Return failed test result
            return {
              multi_choice_question: variant.multiChoiceQuestion,
              correct_letter: variant.correctLetter,
              model_answer: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              score: 0
            } as TestResult;
          }
        });
        
        // Wait for all variants to complete
        const testResults = await Promise.all(variantPromises);
        
        // Update progress after all variants complete
        const completedTests = (qIndex + 1) * 4;
        setProgress((completedTests / totalTests) * 100);
        
        // Calculate average score for this question
        const averageScore = testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length;
        
        // Update the question data
        updated[questionId] = {
          ...questionData,
          test: testResults,
          score: averageScore
        };
        
        addLog(`Question ${questionId} completed. Average score: ${averageScore.toFixed(2)}`);
      }
      
      setUpdatedQuestions(updated);
      setIsRunning(false);
      addLog('All tests completed!');
      onTestingComplete(updated);
    };

    if (isRunning) {
      runTestsAsync();
    }
  }, [isRunning]);

  const startTesting = () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentQuestionIndex(0);
    setLogs([]);
    addLog('Starting AI accuracy testing...');
  };

  const stopTesting = () => {
    setIsRunning(false);
    addLog('Testing stopped by user');
  };

  return (
    <div className="test-runner">
      <h2>AI Testing in Progress</h2>
      
      <div className="test-controls">
        {!isRunning ? (
          <button onClick={startTesting} className="btn btn-primary btn-large">
            Start Testing
          </button>
        ) : (
          <button onClick={stopTesting} className="btn btn-danger">
            Stop Testing
          </button>
        )}
      </div>

      {(isRunning || progress > 0) && (
        <div className="test-progress">
          <div className="progress-info">
            <h3>Progress: {progress.toFixed(1)}%</h3>
            <p>Question {currentQuestionIndex + 1} of {questionEntries.length}</p>
            <p>Running 4 variants in parallel</p>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="current-test">
            <strong>Current Test:</strong> {currentTest}
          </div>
        </div>
      )}

      <div className="test-logs">
        <h3>Test Logs</h3>
        <div className="logs-container" ref={logsContainerRef}>
          {logs.map((log, index) => (
            <div key={index} className="log-entry">
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="test-summary">
        <h3>Test Configuration</h3>
        <ul>
          <li>Total Questions: {questionEntries.length}</li>
          <li>Variants per Question: 4</li>
          <li>Total API Calls: {totalTests}</li>
          <li>API Endpoint: https://apix-alpha.32co.com/process_query</li>
          <li>Delay between calls: 1 second</li>
        </ul>
      </div>
    </div>
  );
}

export default TestRunner;
