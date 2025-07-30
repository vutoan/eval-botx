import type { QuestionsCollection, TestResult } from "../types";

interface ResultsProps {
  questions: QuestionsCollection;
}

function Results({ questions }: ResultsProps) {
  const questionEntries = Object.entries(questions);
  const totalQuestions = questionEntries.length;
  const totalTests = questionEntries.reduce(
    (sum, [, q]) => sum + q.test.length,
    0
  );
  const totalCorrect = questionEntries.reduce(
    (sum, [, q]) =>
      sum + q.test.reduce((testSum, test) => testSum + test.score, 0),
    0
  );
  const overallAccuracy =
    totalTests > 0 ? (totalCorrect / totalTests) * 100 : 0;

  const parseModelAnswer = (modelAnswer: string): TestResult | null => {
    try {
      return JSON.parse(modelAnswer);
    } catch {
      return null;
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-test-results-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results">
      <h2>AI Accuracy Test Results</h2>

      <div className="results-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Overall Accuracy</h3>
            <div className="metric">{overallAccuracy.toFixed(1)}%</div>
            <p>
              {totalCorrect} correct out of {totalTests} tests
            </p>
          </div>

          <div className="summary-card">
            <h3>Questions Tested</h3>
            <div className="metric">{totalQuestions}</div>
            <p>Each with 4 shuffled variants</p>
          </div>

          <div className="summary-card">
            <h3>Perfect Score Rate</h3>
            <div className="metric">
              {(
                (questionEntries.filter(([, q]) => q.score === 1).length /
                  totalQuestions) *
                100
              ).toFixed(1)}
              %
            </div>
            <p>
              {questionEntries.filter(([, q]) => q.score === 1).length}{" "}
              questions answered perfectly
            </p>
          </div>
        </div>

        <button onClick={exportResults} className="btn btn-secondary">
          Export Results as JSON
        </button>
      </div>

      <div className="detailed-results">
        <h3>Question-by-Question Results</h3>

        {questionEntries.map(([id, question]) => {
          const questionScore = (question.score * 100).toFixed(1);
          const correctCount = question.test.reduce(
            (sum, test) => sum + test.score,
            0
          );

          return (
            <div key={id} className="question-result">
              <div className="question-header">
                <div className="question-info">
                  <h4>
                    Question {id}: {question.category}
                  </h4>
                  <p className="question-text">{question.question}</p>
                </div>
                <div className="question-score">
                  <span
                    className={`score ${
                      question.score >= 0.75
                        ? "good"
                        : question.score >= 0.5
                        ? "ok"
                        : "poor"
                    }`}
                  >
                    {questionScore}%
                  </span>
                  <span className="score-detail">{correctCount}/4 correct</span>
                </div>
              </div>

              <div className="correct-answer">
                <strong>Correct Answer:</strong> {question.correct_letter} -{" "}
                {question.correct_answer}
                <br />
                <strong>Human Explanation:</strong> {question.human_answer}
              </div>

              <div className="test-variants">
                <h5>AI Test Results:</h5>
                {question.test.map((test, index) => {
                  // const modelResponse = parseModelAnswer(test.model_answer);
                  const isCorrect = test.score === 1;

                  return (
                    <div
                      key={index}
                      className={`variant-result ${
                        isCorrect ? "correct" : "incorrect"
                      }`}
                    >
                      <div className="variant-header">
                        <span className="variant-number">
                          Variant {index + 1}
                        </span>
                        <span
                          className={`result-badge ${
                            isCorrect ? "correct" : "incorrect"
                          }`}
                        >
                          {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      </div>

                      <div className="variant-details">
                        <p>
                          <strong>Expected:</strong> {test.correct_letter}
                        </p>
                        <p>
                          <strong>AI Answer:</strong>{" "}
                          {test.model_answer_letter}
                        </p>
                        <p>
                          <strong>AI Explanation:</strong>{" "}
                          {test.model_answer}
                        </p>
                      </div>

                      <details className="variant-question">
                        <summary>View Full Question Prompt</summary>
                        <pre>{test.multi_choice_question}</pre>
                      </details>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="results-footer">
        <h3>Analysis Summary</h3>
        <div className="analysis">
          <p>
            <strong>Consistency Analysis:</strong> The AI achieved{" "}
            {overallAccuracy.toFixed(1)}% accuracy across all question variants.
            {overallAccuracy >= 90
              ? " This indicates very high consistency."
              : overallAccuracy >= 75
              ? " This indicates good consistency with some variance."
              : overallAccuracy >= 50
              ? " This indicates moderate consistency with notable variance."
              : " This indicates low consistency with significant variance across question formats."}
          </p>

          <p>
            <strong>Perfect Score Rate:</strong>{" "}
            {questionEntries.filter(([, q]) => q.score === 1).length} out of{" "}
            {totalQuestions} questions (
            {(
              (questionEntries.filter(([, q]) => q.score === 1).length /
                totalQuestions) *
              100
            ).toFixed(1)}
            %) were answered correctly in all 4 shuffled variants, showing the
            AI's robustness to answer choice ordering.
          </p>

          <p>
            <strong>Categories Tested:</strong>{" "}
            {[...new Set(questionEntries.map(([, q]) => q.category))].join(
              ", "
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Results;
