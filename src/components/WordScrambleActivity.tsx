import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, RotateCcw, Shuffle } from "lucide-react";

interface ScrambledWord {
  scrambled: string;
  answer: string;
  hint?: string;
}

interface WordScrambleActivityProps {
  title?: string;
  words: ScrambledWord[];
}

export const WordScrambleActivity = ({ title, words }: WordScrambleActivityProps) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (index: number, value: string) => {
    if (showResults) return;
    setUserAnswers({ ...userAnswers, [index]: value });
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetActivity = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  const isCorrect = (index: number): boolean => {
    const userAnswer = userAnswers[index]?.trim().toLowerCase() || "";
    const correctAnswer = words[index].answer.trim().toLowerCase();
    return userAnswer === correctAnswer;
  };

  const getScore = () => {
    let correct = 0;
    words.forEach((_, index) => {
      if (isCorrect(index)) correct++;
    });
    return correct;
  };

  const allAnswered = words.every((_, index) => userAnswers[index]?.trim());

  return (
    <div className="space-y-4">
      {title && <h4 className="font-semibold text-foreground">{title}</h4>}
      
      <p className="text-sm text-muted-foreground text-center">
        Unscramble the letters to form the correct word
      </p>

      <div className="space-y-3">
        {words.map((word, index) => {
          const answered = userAnswers[index]?.trim();
          const correct = showResults && isCorrect(index);
          const incorrect = showResults && answered && !isCorrect(index);

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                correct
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : incorrect
                  ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                  : "border-border bg-card"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}.
                    </span>
                    <div className="flex items-center gap-2">
                      <Shuffle className="w-4 h-4 text-primary" />
                      <span className="text-lg font-bold text-primary tracking-wider">
                        {word.scrambled.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {showResults && (
                    <>
                      {correct ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : incorrect ? (
                        <X className="w-5 h-5 text-red-600" />
                      ) : null}
                    </>
                  )}
                </div>

                {word.hint && (
                  <p className="text-xs text-muted-foreground italic pl-7">
                    💡 Hint: {word.hint}
                  </p>
                )}

                <div className="pl-7">
                  <Input
                    type="text"
                    value={userAnswers[index] || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder="Type the unscrambled word..."
                    disabled={showResults}
                    className={`max-w-xs ${
                      correct
                        ? "border-green-500"
                        : incorrect
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {showResults && incorrect && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Correct answer: <span className="font-semibold">{word.answer}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showResults && (
        <div className="text-center p-4 bg-accent/50 rounded-lg">
          <p className="text-lg font-semibold text-foreground">
            Score: {getScore()} / {words.length}
          </p>
        </div>
      )}

      <div className="flex justify-center">
        {!showResults ? (
          <Button
            onClick={checkAnswers}
            disabled={!allAnswered}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Check className="w-4 h-4 mr-2" />
            Check Answers
          </Button>
        ) : (
          <Button
            onClick={resetActivity}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
