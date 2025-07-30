import type { QuestionsCollection } from '../types';

interface QuestionsListProps {
  questions: QuestionsCollection;
}

function QuestionsList({ questions }: QuestionsListProps) {
  const questionEntries = Object.entries(questions);

  return (
    <div className="questions-list">
      <h2>Loaded Questions ({questionEntries.length})</h2>
      <p className="list-description">
        Review the questions below before starting the AI testing process.
      </p>

      <div className="questions-grid">
        {questionEntries.map(([id, question]) => (
          <div key={id} className="question-card">
            <div className="question-header">
              <span className="question-number">Question {id}</span>
              <span className="question-category">{question.category}</span>
            </div>
            
            <div className="question-content">
              <h3>{question.question}</h3>
              
              <div className="options">
                {question.multiple_choice.map((option, index) => (
                  <div 
                    key={index} 
                    className={`option ${String.fromCharCode(65 + index) === question.correct_letter ? 'correct' : ''}`}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                    <span className="option-text">{option}</span>
                    {String.fromCharCode(65 + index) === question.correct_letter && (
                      <span className="correct-indicator">✓</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="answer-section">
                <p><strong>Correct Answer:</strong> {question.correct_letter} - {question.correct_answer}</p>
                <p><strong>Explanation:</strong> {question.human_answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="summary">
        <h3>Testing Plan</h3>
        <p>
          Each question will be tested with <strong>4 different shuffled versions</strong> of the answer choices
          to evaluate AI consistency. The AI will be scored on how many variants it answers correctly.
        </p>
        <ul>
          <li>Total questions: {questionEntries.length}</li>
          <li>Total tests to run: {questionEntries.length * 4}</li>
          <li>Scoring: 1 point per correct answer, 0 for incorrect</li>
        </ul>
      </div>
    </div>
  );
}

export default QuestionsList;
