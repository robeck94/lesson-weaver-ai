import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface TrueFalseItem {
  statement: string;
  answer: boolean;
  explanation?: string;
}

interface TrueFalseActivityProps {
  items: TrueFalseItem[];
}

export const TrueFalseActivity: React.FC<TrueFalseActivityProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentItem = items[currentIndex];
  const isCorrect = selectedAnswer === currentItem.answer;

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">True or False</h3>
        <p className="text-muted-foreground">
          Read the statement and decide if it's true or false
        </p>
        <div className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {items.length}
        </div>
      </div>

      {/* Statement Card */}
      <Card className="p-8 bg-gradient-to-br from-card to-muted/20 border-2 border-border">
        <p className="text-lg md:text-xl text-center text-foreground leading-relaxed">
          {currentItem.statement}
        </p>
      </Card>

      {/* Answer Buttons */}
      {!showFeedback ? (
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => handleAnswer(true)}
            size="lg"
            className="min-w-[160px] h-16 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            ✓ True
          </Button>
          <Button
            onClick={() => handleAnswer(false)}
            size="lg"
            className="min-w-[160px] h-16 text-lg bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            ✗ False
          </Button>
        </div>
      ) : (
        /* Feedback */
        <Card className={`p-6 ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-600 text-lg">Correct!</div>
                    <div className="text-sm text-muted-foreground">
                      The statement is {currentItem.answer ? 'true' : 'false'}.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-red-600 text-lg">Incorrect</div>
                    <div className="text-sm text-muted-foreground">
                      The statement is actually {currentItem.answer ? 'true' : 'false'}.
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {currentItem.explanation && (
              <div className="pl-9 pt-2 border-t border-border/50">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  <span className="font-medium">Explanation: </span>
                  {currentItem.explanation}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action buttons */}
      {showFeedback && (
        <div className="flex gap-3 justify-center">
          {currentIndex < items.length - 1 ? (
            <Button
              onClick={nextQuestion}
              size="lg"
              className="min-w-[160px]"
            >
              Next Question
            </Button>
          ) : (
            <Button
              onClick={reset}
              size="lg"
              variant="outline"
              className="min-w-[160px]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
