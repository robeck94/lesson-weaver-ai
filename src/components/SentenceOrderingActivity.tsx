import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface OrderingItem {
  sentence: string;
  words: string[];
}

interface SentenceOrderingActivityProps {
  items: OrderingItem[];
}

export const SentenceOrderingActivity: React.FC<SentenceOrderingActivityProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draggedWords, setDraggedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>(
    shuffleArray([...items[0].words])
  );
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  function shuffleArray(array: string[]) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const handleDragStart = (e: React.DragEvent, word: string, source: 'available' | 'dragged') => {
    e.dataTransfer.setData('word', word);
    e.dataTransfer.setData('source', source);
  };

  const handleDrop = (e: React.DragEvent, target: 'available' | 'dragged') => {
    e.preventDefault();
    const word = e.dataTransfer.getData('word');
    const source = e.dataTransfer.getData('source') as 'available' | 'dragged';

    if (source === target) return;

    if (target === 'dragged') {
      setAvailableWords(prev => prev.filter(w => w !== word));
      setDraggedWords(prev => [...prev, word]);
    } else {
      setDraggedWords(prev => prev.filter(w => w !== word));
      setAvailableWords(prev => [...prev, word]);
    }
    setFeedback(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const checkAnswer = () => {
    const correctSentence = items[currentIndex].sentence.toLowerCase().replace(/[.,!?]/g, '');
    const userSentence = draggedWords.join(' ').toLowerCase();
    
    if (correctSentence === userSentence) {
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
  };

  const reset = () => {
    setDraggedWords([]);
    setAvailableWords(shuffleArray([...items[currentIndex].words]));
    setFeedback(null);
  };

  const nextItem = () => {
    if (currentIndex < items.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setDraggedWords([]);
      setAvailableWords(shuffleArray([...items[nextIdx].words]));
      setFeedback(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Sentence Ordering</h3>
        <p className="text-muted-foreground">
          Drag the words to arrange them in the correct order
        </p>
        <div className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {items.length}
        </div>
      </div>

      {/* Drop zone for ordered words */}
      <Card className="p-6 bg-card border-2 border-dashed border-border min-h-[120px]">
        <div className="text-sm font-medium text-muted-foreground mb-3">
          Your sentence:
        </div>
        <div
          className="flex flex-wrap gap-2 min-h-[60px]"
          onDrop={(e) => handleDrop(e, 'dragged')}
          onDragOver={handleDragOver}
        >
          {draggedWords.length === 0 ? (
            <div className="text-muted-foreground/50 italic">
              Drag words here to build your sentence
            </div>
          ) : (
            draggedWords.map((word, idx) => (
              <div
                key={`${word}-${idx}`}
                draggable
                onDragStart={(e) => handleDragStart(e, word, 'dragged')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-move hover:bg-primary/90 transition-colors shadow-sm"
              >
                {word}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Available words */}
      <Card className="p-6 bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground mb-3">
          Available words:
        </div>
        <div
          className="flex flex-wrap gap-2 min-h-[60px]"
          onDrop={(e) => handleDrop(e, 'available')}
          onDragOver={handleDragOver}
        >
          {availableWords.map((word, idx) => (
            <div
              key={`${word}-${idx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, word, 'available')}
              className="px-4 py-2 bg-card border-2 border-border rounded-lg cursor-move hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
            >
              {word}
            </div>
          ))}
        </div>
      </Card>

      {/* Feedback */}
      {feedback && (
        <Card className={`p-4 ${feedback === 'correct' ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
          <div className="flex items-center gap-2">
            {feedback === 'correct' ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-600">Correct!</div>
                  <div className="text-sm text-muted-foreground">
                    {items[currentIndex].sentence}
                  </div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-semibold text-red-600">Not quite right</div>
                  <div className="text-sm text-muted-foreground">
                    Try again or check the correct answer: {items[currentIndex].sentence}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={checkAnswer}
          disabled={draggedWords.length === 0 || feedback !== null}
          className="min-w-[120px]"
        >
          Check Answer
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          className="min-w-[120px]"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        {feedback === 'correct' && currentIndex < items.length - 1 && (
          <Button
            onClick={nextItem}
            variant="default"
            className="min-w-[120px]"
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
};
