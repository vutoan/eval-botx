# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# AI API Accuracy Tester

A React TypeScript application for testing the accuracy and consistency of AI APIs with multiple choice questions.

## Features

- 📄 **File Upload**: Upload `.txt` files containing multiple choice questions
- 🔄 **Question Parsing**: Convert text format to structured JSON data
- 🎲 **Answer Shuffling**: Test AI consistency with shuffled answer choices  
- 🤖 **API Integration**: Call external AI API for each question variant
- 📊 **Results Analysis**: Comprehensive scoring and reporting
- 📥 **Export Results**: Download test results as JSON

## How It Works

1. **Upload Questions**: Upload a `.txt` file with questions in the specified format
2. **Review & Start**: Review parsed questions and start the testing process
3. **AI Testing**: The app generates 4 shuffled variants of each question and calls the AI API
4. **Results**: View detailed results showing AI accuracy and consistency

## Question File Format

Questions should be formatted as follows in a `.txt` file:

```
Category:
Mathematics

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
Basic addition: 2 + 2 equals 4
```

Each question block should be separated by empty lines.

## Installation & Setup

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the displayed URL (typically `http://localhost:5173`)

## Usage

1. **Upload File**: Click the upload area or drag-and-drop a `.txt` file with questions
2. **Review Questions**: Check that all questions were parsed correctly
3. **Start Testing**: Begin the AI accuracy testing process
4. **View Results**: Analyze the comprehensive results and export if needed

## Testing Process

For each question, the app:
1. Creates 4 variants with shuffled answer choices
2. Generates properly formatted prompts for the AI API
3. Calls the API and records responses
4. Scores each response (1 for correct, 0 for incorrect)
5. Calculates average accuracy per question

## Results Analysis

The results show:
- **Overall Accuracy**: Percentage of correct answers across all tests
- **Question-by-Question**: Individual question performance with all variants
- **Consistency Analysis**: How well the AI handles shuffled answer choices
- **Perfect Score Rate**: Questions answered correctly in all variants

## Sample Data

A sample questions file (`sample-questions.txt`) is included to test the application.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **CSS3** for responsive styling
- **Fetch API** for HTTP requests

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT License

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
