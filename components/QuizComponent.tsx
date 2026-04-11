import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, CheckSquare } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizComponentProps {
  questions: QuizQuestion[];
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[qIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let newScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        newScore++;
      }
    });
    setScore(newScore);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setSubmitted(false);
    setScore(0);
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-500" />
          Knowledge Check
        </h3>
        {submitted && (
          <div className="text-sm font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Score: {score} / {questions.length}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {questions.map((q, qIdx) => {
          const isCorrect = selectedAnswers[qIdx] === q.answer;
          const showResult = submitted;

          return (
            <div key={qIdx} className="space-y-3">
              <p className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                <span className="text-emerald-500 mr-2">{qIdx + 1}.</span>
                {q.question}
              </p>

              <div className="grid gap-2">
                {q.options.map((option, oIdx) => {
                  let optionClass = "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50";
                  
                  // Selected state
                  if (selectedAnswers[qIdx] === oIdx) {
                    optionClass = "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20";
                  }

                  // Result state
                  if (showResult) {
                    if (oIdx === q.answer) {
                      optionClass = "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                    } else if (selectedAnswers[qIdx] === oIdx) {
                      optionClass = "border-2 border-red-500 bg-red-50 dark:bg-red-900/20";
                    } else {
                      optionClass = "opacity-50 border-gray-200 dark:border-gray-700";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center justify-between group ${optionClass}`}
                    >
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                      {showResult && oIdx === q.answer && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {showResult && selectedAnswers[qIdx] === oIdx && oIdx !== q.answer && <XCircle className="w-4 h-4 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`text-xs p-3 rounded-lg ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400'}`}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers.includes(-1)}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/20"
          >
            Submit Answers
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Quiz
          </button>
        )}
      </div>
    </div>
  );
};