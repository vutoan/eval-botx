import { useState, useRef } from "react";
import { parseXlsxFile, convertToQuestionData } from "../utils/parser";
import type { QuestionsCollection } from "../types";

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
      const parsedQuestions = await parseXlsxFile(file);

      if (parsedQuestions.length === 0) {
        throw new Error(
          "No valid questions found in the file. Please check the format."
        );
      }

      const questionsCollection = convertToQuestionData(parsedQuestions);
      onQuestionsLoaded(questionsCollection);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const isXlsx =
      /\.xlsx$/i.test(file.name) ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!isXlsx) {
      setError("Please select an .xlsx file");
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
        Upload an .xlsx file containing questions in the specified format
      </p>

      <div
        className={`upload-area ${isDragOver ? "drag-over" : ""} ${
          isProcessing ? "processing" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleInputChange}
          style={{ display: "none" }}
        />

        {isProcessing ? (
          <div className="processing">
            <div className="spinner"></div>
            <p>Processing file...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📄</div>
            <p>Drop your .xlsx file here or click to browse</p>
            <p className="file-format">
              Expected columns (7): Category | Question | Option A (correct) |
              Option B | Option C | Option D | Option E
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="format-example">
        <h3>Expected XLSX Format:</h3>
        <pre>{`Sheet 1 (first row is header; ignored):
| category | question       | option A (correct) | option B | option C | option D | option E |
| Math     | What is 2+2?   | 4                   | 3        | 5        | 6        | 7        |

Notes:
- The third column is the correct option (A). We'll set the correct letter to 'A'.
- No explanation in the file; it will be left empty.`}</pre>
      </div>
    </div>
  );
}

export default FileUpload;
