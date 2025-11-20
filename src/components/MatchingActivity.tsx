import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, RotateCcw } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

interface MatchingPair {
  left: string;
  right: string;
}

interface MatchingActivityProps {
  title?: string;
  pairs: MatchingPair[];
}

export const MatchingActivity = ({ title, pairs }: MatchingActivityProps) => {
  const [leftSelected, setLeftSelected] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [shuffledRight, setShuffledRight] = useState<string[]>(() => {
    const rightItems = pairs.map(p => p.right);
    return rightItems.sort(() => Math.random() - 0.5);
  });
  const { getFontSizeClass } = useSettings();

  const handleLeftClick = (index: number) => {
    if (showResults) return;
    if (matches[index] !== undefined) {
      // Unselect if already matched
      const newMatches = { ...matches };
      delete newMatches[index];
      setMatches(newMatches);
      setLeftSelected(null);
    } else {
      setLeftSelected(index);
    }
  };

  const handleRightClick = (rightIndex: number) => {
    if (showResults) return;
    if (leftSelected === null) return;
    
    // Check if this right item is already matched
    const alreadyMatched = Object.values(matches).includes(rightIndex);
    if (alreadyMatched) return;

    setMatches({ ...matches, [leftSelected]: rightIndex });
    setLeftSelected(null);
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetActivity = () => {
    setMatches({});
    setLeftSelected(null);
    setShowResults(false);
    setShuffledRight(pairs.map(p => p.right).sort(() => Math.random() - 0.5));
  };

  const isCorrectMatch = (leftIndex: number, rightIndex: number): boolean => {
    return pairs[leftIndex].right === shuffledRight[rightIndex];
  };

  const getScore = () => {
    let correct = 0;
    Object.entries(matches).forEach(([leftIdx, rightIdx]) => {
      if (isCorrectMatch(Number(leftIdx), rightIdx)) {
        correct++;
      }
    });
    return correct;
  };

  const allMatched = Object.keys(matches).length === pairs.length;

  return (
    <div className="space-y-4">
      {title && <h4 className="font-semibold text-foreground">{title}</h4>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-2">
          <p className="text-base text-foreground font-semibold mb-3">Match these items:</p>
          {pairs.map((pair, index) => {
            const matchedRightIndex = matches[index];
            const isMatched = matchedRightIndex !== undefined;
            const isSelected = leftSelected === index;
            const isCorrect = showResults && isMatched && isCorrectMatch(index, matchedRightIndex);
            const isIncorrect = showResults && isMatched && !isCorrectMatch(index, matchedRightIndex);

            return (
              <Card
                key={index}
                onClick={() => handleLeftClick(index)}
                className={`p-3 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : isMatched
                    ? showResults
                      ? isCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : "border-border bg-muted/50"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`${getFontSizeClass()} font-semibold`}>{pair.left}</span>
                  {showResults && isMatched && (
                    isCorrect ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )
                  )}
                  {isMatched && !showResults && (
                    <span className="text-sm font-medium text-muted-foreground">
                      → {shuffledRight[matchedRightIndex]}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <p className="text-base text-foreground font-semibold mb-3">With these:</p>
          {shuffledRight.map((item, index) => {
            const isMatchedToThis = Object.values(matches).includes(index);
            const leftIndexMatchedToThis = Object.entries(matches).find(
              ([_, rightIdx]) => rightIdx === index
            )?.[0];

            return (
              <Card
                key={index}
                onClick={() => handleRightClick(index)}
                className={`p-3 cursor-pointer transition-all duration-200 ${
                  leftSelected !== null && !isMatchedToThis
                    ? "border-primary/50 hover:border-primary hover:bg-primary/5"
                    : isMatchedToThis
                    ? "border-border bg-muted/50 cursor-default"
                    : "border-border hover:border-border/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`${getFontSizeClass()} font-semibold`}>{item}</span>
                  {showResults && isMatchedToThis && leftIndexMatchedToThis !== undefined && (
                    isCorrectMatch(Number(leftIndexMatchedToThis), index) ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      {!showResults && (
        <p className="text-sm text-muted-foreground text-center font-medium">
          Click an item on the left, then click its match on the right
        </p>
      )}

      {/* Results */}
      {showResults && (
        <div className="text-center p-4 bg-accent/50 rounded-lg">
          <p className="text-lg font-semibold text-foreground">
            Score: {getScore()} / {pairs.length}
          </p>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        {!showResults ? (
          <Button
            onClick={checkAnswers}
            disabled={!allMatched}
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
