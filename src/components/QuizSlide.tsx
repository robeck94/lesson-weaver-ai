import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "./ui/button";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizSlideProps {
  title: string;
  imageUrl?: string;
  questions: QuizQuestion[];
}

export const QuizSlide = ({ title, imageUrl, questions }: QuizSlideProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (!showResults) {
      setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    }
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const score = Object.entries(selectedAnswers).filter(
    ([qIdx, ansIdx]) => questions[parseInt(qIdx)]?.correctAnswer === ansIdx
  ).length;

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="animate-slide-in-right">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Quiz Image */}
        {imageUrl && (
          <div className="w-[45%] flex-shrink-0 animate-fade-in">
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/30 p-6">
              <img
                src={imageUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Questions Panel */}
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          {/* Instruction */}
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 border-2 border-accent/30 rounded-xl p-4">
            <p className="text-lg font-semibold text-foreground">
              {showResults ? `Score: ${score}/${questions.length}` : "Choose the best answer for each question"}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-4 flex-1 overflow-auto">
            {questions.map((q, qIdx) => {
              const isAnswered = selectedAnswers[qIdx] !== undefined;
              const isCorrect = showResults && q.correctAnswer === selectedAnswers[qIdx];
              const isWrong = showResults && isAnswered && !isCorrect;

              return (
                <div
                  key={qIdx}
                  className={`bg-card border-2 rounded-xl p-5 transition-all duration-300 ${
                    showResults
                      ? isCorrect
                        ? "border-green-500/50 bg-green-500/10"
                        : isWrong
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-border/50"
                      : "border-border/50 hover:border-primary/30"
                  }`}
                >
                  {/* Question */}
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0">
                      {qIdx + 1}
                    </span>
                    <p className="text-xl font-medium text-foreground pt-1">{q.question}</p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 ml-11">
                    {q.options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      const isCorrectOption = showResults && q.correctAnswer === optIdx;
                      const showCorrect = showResults && isCorrectOption;
                      const showWrong = showResults && isSelected && !isCorrectOption;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswerSelect(qIdx, optIdx)}
                          disabled={showResults}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                            showCorrect
                              ? "border-green-500 bg-green-500/20 font-semibold"
                              : showWrong
                              ? "border-red-500 bg-red-500/20"
                              : isSelected
                              ? "border-primary bg-primary/10 font-medium"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          } ${showResults ? "cursor-default" : "cursor-pointer"}`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-lg flex-1">{option}</span>
                          {showCorrect && (
                            <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                          )}
                          {showWrong && <X className="w-6 h-6 text-red-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {!showResults ? (
              <Button
                onClick={checkAnswers}
                disabled={Object.keys(selectedAnswers).length !== questions.length}
                className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                Check Answers
              </Button>
            ) : (
              <Button
                onClick={resetQuiz}
                className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-accent to-secondary hover:opacity-90"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
