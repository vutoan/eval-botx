import { useState } from 'react';
import FileUpload from './components/FileUpload';
import QuestionsList from './components/QuestionsList';
import TestRunner from './components/TestRunner';
import Results from './components/Results';
import type { QuestionsCollection } from './types';
import './App.css';

function App() {
  const [questions, setQuestions] = useState<QuestionsCollection>({});
  const [isTestingComplete, setIsTestingComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'testing' | 'results'>('upload');

  const handleQuestionsLoaded = (loadedQuestions: QuestionsCollection) => {
    setQuestions(loadedQuestions);
    setCurrentStep('review');
  };

  const handleStartTesting = () => {
    setCurrentStep('testing');
  };

  const handleTestingComplete = (updatedQuestions: QuestionsCollection) => {
    setQuestions(updatedQuestions);
    setIsTestingComplete(true);
    setCurrentStep('results');
  };

  const handleReset = () => {
    setQuestions({});
    setIsTestingComplete(false);
    setCurrentStep('upload');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>AI API Accuracy Tester</h1>
        <p>Upload questions, test AI API responses, and analyze results</p>
      </header>

      <main className="app-main">
        {currentStep === 'upload' && (
          <FileUpload onQuestionsLoaded={handleQuestionsLoaded} />
        )}

        {currentStep === 'review' && (
          <div>
            <QuestionsList questions={questions} />
            <div className="step-actions">
              <button onClick={handleReset} className="btn btn-secondary">
                Upload Different File
              </button>
              <button onClick={handleStartTesting} className="btn btn-primary">
                Start Testing
              </button>
            </div>
          </div>
        )}

        {currentStep === 'testing' && (
          <TestRunner 
            questions={questions} 
            onTestingComplete={handleTestingComplete}
          />
        )}

        {currentStep === 'results' && isTestingComplete && (
          <div>
            <Results questions={questions} />
            <div className="step-actions">
              <button onClick={handleReset} className="btn btn-primary">
                Test New File
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
