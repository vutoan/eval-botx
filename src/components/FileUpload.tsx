import { useState, useRef } from 'react';
import { parseTextFile, convertToQuestionData } from '../utils/parser';
import type { QuestionsCollection } from '../types';

interface FileUploadProps {
  onQuestionsLoaded: (questions: QuestionsCollection) => void;
}

function FileUpload({ onQuestionsLoaded }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const parsedQuestions = parseTextFile(text);
      
      if (parsedQuestions.length === 0) {
        throw new Error('No valid questions found in the file. Please check the format.');
      }

      const questionsCollection = convertToQuestionData(parsedQuestions);
      onQuestionsLoaded(questionsCollection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setError('Please select a .txt file');
      return;
    }
    handleFileRead(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <h2>Upload Questions File</h2>
      <p className="upload-description">
        Upload a .txt file containing questions in the specified format
      </p>

      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        
        {isProcessing ? (
          <div className="processing">
            <div className="spinner"></div>
            <p>Processing file...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📄</div>
            <p>Drop your .txt file here or click to browse</p>
            <p className="file-format">Expected format: Category, Question, Options A-D, Answer, Explanation</p>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="format-example">
        <h3>Expected File Format:</h3>
        <pre>{`Category:
Math

Question:
What is 2 + 2?

Options:
A. 3
B. 4
C. 5
D. 6

Answer:
B

Explanation:
Basic addition: 2 + 2 equals 4`}</pre>
      </div>
    </div>
  );
}

export default FileUpload;
