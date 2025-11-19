import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, MessageSquare, RotateCcw, ChevronRight } from 'lucide-react';

interface RolePlayTurn {
  role: string;
  prompt: string;
  tips?: string[];
  sampleResponses?: string[];
}

interface RolePlayScenario {
  title: string;
  situation: string;
  roles: string[];
  objective: string;
  turns: RolePlayTurn[];
}

interface RolePlayActivityProps {
  scenarios: RolePlayScenario[];
}

export const RolePlayActivity: React.FC<RolePlayActivityProps> = ({ scenarios }) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<number, string>>({});
  const [showTips, setShowTips] = useState<boolean>(false);
  const [showSamples, setShowSamples] = useState<boolean>(false);

  const currentScenario = scenarios[currentScenarioIndex];
  const currentTurn = currentScenario.turns[currentTurnIndex];
  const isLastTurn = currentTurnIndex === currentScenario.turns.length - 1;

  const handleResponseChange = (value: string) => {
    setUserResponses(prev => ({
      ...prev,
      [currentTurnIndex]: value
    }));
  };

  const nextTurn = () => {
    if (!isLastTurn) {
      setCurrentTurnIndex(currentTurnIndex + 1);
      setShowTips(false);
      setShowSamples(false);
    }
  };

  const nextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      setCurrentTurnIndex(0);
      setUserResponses({});
      setShowTips(false);
      setShowSamples(false);
    }
  };

  const reset = () => {
    setCurrentScenarioIndex(0);
    setCurrentTurnIndex(0);
    setUserResponses({});
    setShowTips(false);
    setShowSamples(false);
  };

  const resetCurrentScenario = () => {
    setCurrentTurnIndex(0);
    setUserResponses({});
    setShowTips(false);
    setShowSamples(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-foreground">Role-Play Practice</h3>
        <p className="text-muted-foreground">
          Practice real-life conversations in different situations
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Scenario {currentScenarioIndex + 1} of {scenarios.length}</span>
          <span>•</span>
          <span>Turn {currentTurnIndex + 1} of {currentScenario.turns.length}</span>
        </div>
      </div>

      {/* Scenario Info Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1 space-y-3">
              <h4 className="text-xl font-bold text-foreground">{currentScenario.title}</h4>
              <p className="text-foreground/80 leading-relaxed">{currentScenario.situation}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-card">
                  <Users className="h-3 w-3 mr-1" />
                  {currentScenario.roles.join(' & ')}
                </Badge>
              </div>

              <div className="bg-card/50 rounded-lg p-3 border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Objective:</p>
                <p className="text-sm text-foreground">{currentScenario.objective}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Turn Card */}
      <Card className="p-6 border-2 border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-bold text-primary text-lg">{currentTurn.role}:</div>
              <Badge variant="secondary" className="text-xs">
                Your turn
              </Badge>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-sm font-medium text-muted-foreground mb-2">What to say:</p>
            <p className="text-foreground leading-relaxed">{currentTurn.prompt}</p>
          </div>

          {/* User Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your response:</label>
            <Textarea
              value={userResponses[currentTurnIndex] || ''}
              onChange={(e) => handleResponseChange(e.target.value)}
              placeholder="Type or speak your response here..."
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Help Buttons */}
          <div className="flex gap-2">
            {currentTurn.tips && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTips(!showTips)}
                className="gap-2"
              >
                <Lightbulb className={`h-4 w-4 ${showTips ? 'text-yellow-500' : ''}`} />
                {showTips ? 'Hide Tips' : 'Show Tips'}
              </Button>
            )}
            {currentTurn.sampleResponses && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSamples(!showSamples)}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {showSamples ? 'Hide Examples' : 'Show Examples'}
              </Button>
            )}
          </div>

          {/* Tips */}
          {showTips && currentTurn.tips && (
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-yellow-800 dark:text-yellow-200">
                  <Lightbulb className="h-4 w-4" />
                  Tips:
                </div>
                <ul className="space-y-1 text-sm text-yellow-900 dark:text-yellow-100 ml-6 list-disc">
                  {currentTurn.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Sample Responses */}
          {showSamples && currentTurn.sampleResponses && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="space-y-2">
                <div className="font-semibold text-blue-800 dark:text-blue-200">
                  Example Responses:
                </div>
                <div className="space-y-2">
                  {currentTurn.sampleResponses.map((response, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-blue-900 dark:text-blue-100 pl-3 border-l-2 border-blue-300 dark:border-blue-700"
                    >
                      "{response}"
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 justify-center flex-wrap">
        {!isLastTurn ? (
          <Button
            onClick={nextTurn}
            disabled={!userResponses[currentTurnIndex]?.trim()}
            size="lg"
            className="min-w-[160px]"
          >
            Next Turn
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : currentScenarioIndex < scenarios.length - 1 ? (
          <Button
            onClick={nextScenario}
            disabled={!userResponses[currentTurnIndex]?.trim()}
            size="lg"
            className="min-w-[160px]"
          >
            Next Scenario
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={reset}
            disabled={!userResponses[currentTurnIndex]?.trim()}
            size="lg"
            variant="default"
            className="min-w-[160px]"
          >
            Start Over
          </Button>
        )}
        
        <Button
          onClick={resetCurrentScenario}
          variant="outline"
          size="lg"
          className="min-w-[160px]"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Scenario
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2">
        {currentScenario.turns.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx < currentTurnIndex
                ? 'w-8 bg-green-500'
                : idx === currentTurnIndex
                ? 'w-12 bg-primary'
                : 'w-8 bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
