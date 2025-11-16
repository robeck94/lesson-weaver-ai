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
    <div className="h-full flex flex-col gap-3 md:gap-4 overflow-hidden">
      {/* Header */}
      <div className="animate-slide-in-right flex-shrink-0">
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-1 md:mb-2">
          {title}
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-3 md:gap-4 min-h-0 overflow-hidden">
        {/* Quiz Image */}
        {imageUrl && (
          <div className="w-[35%] md:w-[40%] flex-shrink-0 animate-fade-in">
            <div className="h-full flex items-start justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/30 p-3 md:p-4 overflow-hidden">
              <img
                src={imageUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Questions Panel */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Instruction */}
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 border-2 border-accent/30 rounded-lg p-3 flex-shrink-0">
            <p className="text-sm md:text-base lg:text-lg font-semibold text-foreground">
              {showResults ? `Score: ${score}/${questions.length}` : "Choose the best answer for each question"}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {questions.map((q, qIdx) => {
              const isAnswered = selectedAnswers[qIdx] !== undefined;
              const isCorrect = showResults && q.correctAnswer === selectedAnswers[qIdx];
              const isWrong = showResults && isAnswered && !isCorrect;

              return (
                <div
                  key={qIdx}
                  className={`bg-card border-2 rounded-lg p-4 transition-all duration-300 ${
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
                  <div className="flex items-start gap-2 md:gap-3 mb-3">
                    <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 text-sm md:text-base">
                      {qIdx + 1}
                    </span>
                    <p className="text-sm md:text-base lg:text-lg xl:text-xl font-medium text-foreground pt-0.5 md:pt-1 break-words">{q.question}</p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 ml-8 md:ml-11">
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
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 md:gap-3 ${
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
                            className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm md:text-base lg:text-lg flex-1 break-words">{option}</span>
                          {showCorrect && (
                            <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
                          )}
                          {showWrong && <X className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 flex-shrink-0">
            {!showResults ? (
              <Button
                onClick={checkAnswers}
                disabled={Object.keys(selectedAnswers).length !== questions.length}
                className="flex-1 h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                Check Answers
              </Button>
            ) : (
              <Button
                onClick={resetQuiz}
                className="flex-1 h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-accent to-secondary hover:opacity-90"
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
