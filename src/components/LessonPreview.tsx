import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Clock, Layers, Maximize2 } from "lucide-react";
import type { LessonSlide } from "@/pages/Index";
import { useState } from "react";
import { PresentationMode } from "./PresentationMode";
import { ImageValidationWarning } from "./ImageValidationWarning";
import { MatchingActivity } from "./MatchingActivity";
import { QuizSlide } from "./QuizSlide";
import { FillInTheBlankActivity } from "./FillInTheBlankActivity";
import { WordScrambleActivity } from "./WordScrambleActivity";
import { SentenceOrderingActivity } from "./SentenceOrderingActivity";
import { TrueFalseActivity } from "./TrueFalseActivity";

interface LessonPreviewProps {
  slides: LessonSlide[];
}

const STAGE_COLORS: Record<string, string> = {
  "Lead-in": "bg-primary/10 text-primary border-primary/20",
  "Presentation": "bg-secondary/10 text-secondary border-secondary/20",
  "Practice": "bg-accent/10 text-accent border-accent/20",
  "Production": "bg-success/10 text-success border-success/20",
  "Consolidation": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
  "Assessment": "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300",
};

export const LessonPreview = ({ slides }: LessonPreviewProps) => {
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  if (isPresentationMode) {
    return (
      <PresentationMode 
        slides={slides} 
        onClose={() => setIsPresentationMode(false)} 
      />
    );
  }

  return (
    <Card className="shadow-medium border-border/50">
      <CardHeader className="gradient-card border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Layers className="w-5 h-5 text-primary" />
            Lesson Slides ({slides.length})
          </CardTitle>
          <Button
            onClick={() => setIsPresentationMode(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Present
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-6 space-y-4">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="border border-border rounded-xl p-5 bg-card hover:shadow-soft transition-all duration-300 animate-slide-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Slide Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {slide.slideNumber}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{slide.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${STAGE_COLORS[slide.stage] || "bg-muted"}`}
                        >
                          {slide.stage}
                        </Badge>
                        {slide.timing && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slide.timing}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide Content */}
                <div className="space-y-3">
                  {(() => {
                    // Check if this slide has an interactive activity
                    let hasInteractiveActivity = false;
                    try {
                      if (slide.activityInstructions) {
                        const activityData = JSON.parse(slide.activityInstructions);
                        hasInteractiveActivity = ['matching', 'quiz', 'fillblank', 'scramble', 'ordering', 'truefalse'].includes(activityData.type);
                      }
                    } catch (e) {
                      // Not an interactive activity
                    }

                    return (
                      <>
                        {/* Only show text content if no interactive activity */}
                        {!hasInteractiveActivity && (
                          <div className="content-box">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                              {slide.content}
                            </p>
                          </div>
                        )}

                        {/* Show image only if NOT an interactive activity */}
                        {slide.imageUrl && !hasInteractiveActivity && (
                          <div className="rounded-lg overflow-hidden border border-border/50">
                            <img 
                              src={slide.imageUrl} 
                              alt={slide.title}
                              className="w-full h-auto"
                            />
                          </div>
                        )}

                        {/* Image Validation Warning */}
                        {slide.imageValidation && !hasInteractiveActivity && (
                          <ImageValidationWarning
                            validation={slide.imageValidation}
                            slideNumber={slide.slideNumber}
                            slideTitle={slide.title}
                          />
                        )}

                        {/* Visual Description - only show for non-interactive slides */}
                        {slide.visualDescription && !hasInteractiveActivity && (
                          <div className="text-xs space-y-1">
                            <p className="text-muted-foreground font-medium">Visual Design:</p>
                            <p className="text-muted-foreground italic pl-2 border-l-2 border-primary/30">
                              {slide.visualDescription}
                            </p>
                          </div>
                        )}

                        {/* Animation Notes */}
                        {slide.animationNotes && (
                          <div className="text-xs space-y-1">
                            <p className="text-muted-foreground font-medium">Animations:</p>
                            <p className="text-muted-foreground italic pl-2 border-l-2 border-secondary/30">
                              {slide.animationNotes}
                            </p>
                          </div>
                        )}

                        {/* Activity Instructions */}
                        {slide.activityInstructions && (
                          <>
                            {(() => {
                              try {
                                const activityData = JSON.parse(slide.activityInstructions);
                                
                                if (activityData.type === 'matching' && activityData.pairs) {
                                  return (
                                    <div className="w-full max-h-[600px] overflow-y-auto">
                                      <div className="activity-box">
                                        <MatchingActivity 
                                          title="🎯 Matching Activity"
                                          pairs={activityData.pairs}
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                                
                                if (activityData.type === 'quiz' && activityData.questions) {
                                  return (
                                    <div className="w-full max-h-[600px] overflow-y-auto">
                                      <div className="activity-box">
                                        <QuizSlide 
                                          title="🎯 Quiz"
                                          questions={activityData.questions}
                                        />
                                      </div>
                                    </div>
                                  );
                                }

                                if (activityData.type === 'fillblank' && activityData.items) {
                                  return (
                                    <div className="w-full max-h-[600px] overflow-y-auto">
                                      <div className="activity-box">
                                        <FillInTheBlankActivity 
                                          title="✏️ Fill in the Blanks"
                                          items={activityData.items}
                                        />
                                      </div>
                                    </div>
                                  );
                                }

                                 if (activityData.type === 'scramble' && activityData.words) {
                                  return (
                                    <div className="w-full max-h-[600px] overflow-y-auto">
                                      <div className="activity-box">
                                        <WordScrambleActivity 
                                          title="🔤 Word Scramble"
                                          words={activityData.words}
                                        />
                                      </div>
                                    </div>
                                  );
                                }

                                if (activityData.type === 'ordering' && activityData.items) {
                                  return (
                                    <div className="w-full max-h-[600px] overflow-y-auto">
                                      <div className="activity-box">
                                        <SentenceOrderingActivity 
                                          items={activityData.items}
                                        />
                                      </div>
                                    </div>
                                  );
                                }

                                if (activityData.type === 'truefalse' && activityData.items) {
                                  return (
                                    <div className="w-full max-h-[600px] overflow-y-auto">
                                      <div className="activity-box">
                                        <TrueFalseActivity 
                                          items={activityData.items}
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                              } catch (e) {
                                // If not JSON or parsing fails, render as regular text
                              }
                              
                              return (
                                <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-xs">
                                  <p className="text-accent font-medium mb-1">Activity:</p>
                                  <p className="text-foreground">{slide.activityInstructions}</p>
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
