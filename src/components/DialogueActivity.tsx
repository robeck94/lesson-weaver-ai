import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, RotateCcw, Lightbulb } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface DialogueLine {
  speaker: string;
  text: string;
  isBlank?: boolean;
  answer?: string;
  hint?: string;
}

interface DialogueActivityProps {
  lines: DialogueLine[];
  title?: string;
}

export const DialogueActivity: React.FC<DialogueActivityProps> = ({ lines, title = "Complete the Dialogue" }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHints, setShowHints] = useState<Set<number>>(new Set());
  const { getFontSizeClass } = useSettings();

  const blankLines = lines.filter(line => line.isBlank);

  const handleAnswerChange = (index: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const toggleHint = (index: number) => {
    setShowHints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const checkAnswers = () => {
    setShowFeedback(true);
  };

  const reset = () => {
    setUserAnswers({});
    setShowFeedback(false);
    setShowHints(new Set());
  };

  const isCorrect = (index: number) => {
    const line = lines[index];
    if (!line.isBlank || !line.answer) return false;
    const userAnswer = userAnswers[index]?.trim().toLowerCase() || '';
    const correctAnswer = line.answer.trim().toLowerCase();
    return userAnswer === correctAnswer;
  };

  const allAnswered = blankLines.every((_, idx) => {
    const lineIndex = lines.findIndex(line => line === blankLines[idx]);
    return userAnswers[lineIndex]?.trim();
  });

  const allCorrect = blankLines.every((_, idx) => {
    const lineIndex = lines.findIndex(line => line === blankLines[idx]);
    return isCorrect(lineIndex);
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        <p className="text-muted-foreground">
          Fill in the missing parts of the conversation
        </p>
      </div>

      {/* Dialogue Display */}
      <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-2 border-border space-y-4">
        {lines.map((line, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start gap-3">
              <div className={`${getFontSizeClass()} font-semibold text-primary min-w-[100px]`}>
                {line.speaker}:
              </div>
              <div className="flex-1">
                {line.isBlank ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        value={userAnswers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={showFeedback}
                        className={`w-full ${
                          showFeedback
                            ? isCorrect(index)
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                              : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                            : 'border-primary/50 focus:border-primary'
                        }`}
                      />
                      {line.hint && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHint(index)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
                        >
                          <Lightbulb className={`h-4 w-4 ${showHints.has(index) ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                        </Button>
                      )}
                    </div>
                    
                    {/* Hint */}
                    {line.hint && showHints.has(index) && (
                      <div className="text-sm text-muted-foreground italic pl-3 border-l-2 border-yellow-500/50">
                        💡 Hint: {line.hint}
                      </div>
                    )}
                    
                    {/* Feedback */}
                    {showFeedback && (
                      <div className="flex items-start gap-2">
                        {isCorrect(index) ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-green-600 font-medium">
                              Correct!
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm space-y-1">
                              <div className="text-red-600 font-medium">
                                Not quite right
                              </div>
                              <div className="text-muted-foreground">
                                Correct answer: <span className="font-semibold text-foreground">{line.answer}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={`${getFontSizeClass()} text-foreground font-medium`}>{line.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Overall Feedback */}
      {showFeedback && (
        <Card className={`p-4 ${allCorrect ? 'bg-green-500/10 border-green-500' : 'bg-amber-500/10 border-amber-500'}`}>
          <div className="flex items-center gap-2">
            {allCorrect ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="font-semibold text-green-600">
                  Perfect! All answers are correct!
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-amber-600" />
                <div className="text-amber-600">
                  Some answers need correction. Review the feedback above.
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        {!showFeedback ? (
          <Button
            onClick={checkAnswers}
            disabled={!allAnswered}
            className="min-w-[160px]"
            size="lg"
          >
            Check Answers
          </Button>
        ) : (
          <Button
            onClick={reset}
            variant="outline"
            className="min-w-[160px]"
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
