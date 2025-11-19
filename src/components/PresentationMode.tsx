import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ChevronLeft, ChevronRight, Play, Sparkles } from "lucide-react";
import type { LessonSlide } from "@/pages/Index";
import { QuizSlide } from "./QuizSlide";
import { MatchingActivity } from "./MatchingActivity";
import { FillInTheBlankActivity } from "./FillInTheBlankActivity";
import { WordScrambleActivity } from "./WordScrambleActivity";
import { SentenceOrderingActivity } from "./SentenceOrderingActivity";
import { TrueFalseActivity } from "./TrueFalseActivity";
import { DialogueActivity } from "./DialogueActivity";
import { RolePlayActivity } from "./RolePlayActivity";

type TransitionEffect = "fade" | "slide" | "zoom";

interface PresentationModeProps {
  slides: LessonSlide[];
  onClose: () => void;
}

export const PresentationMode = ({ slides, onClose }: PresentationModeProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedElements, setRevealedElements] = useState<Set<number>>(new Set());
  const [transitionEffect, setTransitionEffect] = useState<TransitionEffect>("fade");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        const slide = slides[currentSlide];
        const contentParts = slide.content.split('\n').filter(part => part.trim());
        const nextUnrevealed = contentParts.findIndex((_, i) => !revealedElements.has(i));
        
        if (nextUnrevealed !== -1) {
          revealElement(nextUnrevealed);
        } else {
          nextSlide();
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, revealedElements]);

  useEffect(() => {
    // Enter fullscreen
    if (containerRef.current) {
      containerRef.current.requestFullscreen?.();
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  useEffect(() => {
    setRevealedElements(new Set());
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1 && !isAnimating) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0 && !isAnimating) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const revealElement = (index: number) => {
    setRevealedElements(prev => {
      const newSet = new Set([...prev]);
      newSet.add(index);
      return newSet;
    });
  };

  const handleCardClick = (index: number) => {
    // Allow clicking any card, but reveal in order up to that point
    for (let i = 0; i <= index; i++) {
      if (!revealedElements.has(i)) {
        revealElement(i);
        break; // Reveal one at a time
      }
    }
  };

  const slide = slides[currentSlide];
  const contentParts = slide.content.split('\n').filter(part => part.trim());

  // Dynamic font sizing based on content length
  const totalChars = slide.content.length;
  const lineCount = contentParts.length;
  const avgLineLength = totalChars / Math.max(lineCount, 1);
  
  // Calculate appropriate text sizes
  const getTitleSize = () => {
    if (slide.title.length > 80) return "text-2xl md:text-3xl lg:text-4xl";
    if (slide.title.length > 50) return "text-3xl md:text-4xl lg:text-5xl";
    return "text-3xl md:text-4xl lg:text-5xl xl:text-6xl";
  };

  const getContentSize = () => {
    // Very dense content (lots of text)
    if (totalChars > 600 || lineCount > 10) return "text-sm md:text-base lg:text-lg";
    // Dense content
    if (totalChars > 400 || lineCount > 7) return "text-base md:text-lg lg:text-xl";
    // Medium content
    if (totalChars > 250 || lineCount > 5) return "text-lg md:text-xl lg:text-2xl";
    // Light content - can be bigger
    return "text-xl md:text-2xl lg:text-3xl";
  };

  const getLineSpacing = () => {
    if (lineCount > 8) return "leading-snug";
    if (lineCount > 5) return "leading-relaxed";
    return "leading-loose";
  };

  const getCardPadding = () => {
    if (lineCount > 8) return "p-3 md:p-4";
    if (lineCount > 5) return "p-4 md:p-5";
    return "p-4 md:p-5 lg:p-6";
  };

  const getSpacing = () => {
    if (lineCount > 8) return "space-y-2";
    if (lineCount > 5) return "space-y-2 md:space-y-3";
    return "space-y-3 md:space-y-4";
  };

  // Detect if this is a quiz slide
  const isQuizSlide = slide.title.toLowerCase().includes('quiz') || 
                      slide.activityInstructions?.toLowerCase().includes('quiz') ||
                      contentParts.some(part => part.match(/^[a-d]\)/i));

  // Detect if this is an interactive activity slide (matching, fillblank, scramble)
  const isInteractiveSlide = (() => {
    try {
      if (slide.activityInstructions) {
        const activityData = JSON.parse(slide.activityInstructions);
        return ['matching', 'fillblank', 'scramble', 'ordering', 'truefalse', 'dialogue', 'roleplay'].includes(activityData.type);
      }
    } catch (e) {
      return false;
    }
    return false;
  })();

  // Parse quiz content if it's a quiz slide
  const parseQuizContent = () => {
    const questions: Array<{ question: string; options: string[]; correctAnswer: number }> = [];
    let currentQuestion = "";
    let currentOptions: string[] = [];
    
    contentParts.forEach((part, idx) => {
      // Check if it's a numbered question
      if (part.match(/^\d+\./)) {
        // Save previous question if exists
        if (currentQuestion && currentOptions.length > 0) {
          questions.push({
            question: currentQuestion,
            options: currentOptions,
            correctAnswer: 1 // Default to second option, can be enhanced
          });
        }
        currentQuestion = part.replace(/^\d+\.\s*/, '');
        currentOptions = [];
      }
      // Check if it's an option
      else if (part.match(/^[a-d]\)/i)) {
        currentOptions.push(part.replace(/^[a-d]\)\s*/i, ''));
      }
    });
    
    // Save last question
    if (currentQuestion && currentOptions.length > 0) {
      questions.push({
        question: currentQuestion,
        options: currentOptions,
        correctAnswer: 1
      });
    }
    
    return questions;
  };

  const quizQuestions = isQuizSlide ? parseQuizContent() : [];

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      "Lead-in": "from-accent/20 to-accent/5 border-accent/30",
      "Presentation": "from-primary/20 to-primary/5 border-primary/30",
      "Practice": "from-secondary/20 to-secondary/5 border-secondary/30",
      "Production": "from-primary/30 to-primary/10 border-primary/40",
      "Consolidation": "from-accent/30 to-accent/10 border-accent/40"
    };
    return colors[stage] || "from-muted/20 to-muted/5 border-border";
  };

  const getTransitionClass = () => {
    if (!isAnimating) return "";
    
    switch (transitionEffect) {
      case "fade":
        return "animate-fade-in";
      case "slide":
        return "animate-slide-in-right";
      case "zoom":
        return "animate-scale-in";
      default:
        return "animate-fade-in";
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-br from-background via-muted/30 to-background z-50 flex flex-col"
    >
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStageColor(slide.stage)} border`}>
                {slide.stage}
              </div>
              {slide.timing && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-muted/50 border border-border">
                  ⏱️ {slide.timing}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Transition Effect Selector */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <Select value={transitionEffect} onValueChange={(value) => setTransitionEffect(value as TransitionEffect)}>
                <SelectTrigger className="w-[120px] h-8 bg-card border-border shadow-sm hover:bg-accent/10 z-50">
                  <SelectValue placeholder="Transition" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border shadow-xl z-[100]">
                  <SelectItem value="fade" className="cursor-pointer hover:bg-accent/10">
                    Fade
                  </SelectItem>
                  <SelectItem value="slide" className="cursor-pointer hover:bg-accent/10">
                    Slide
                  </SelectItem>
                  <SelectItem value="zoom" className="cursor-pointer hover:bg-accent/10">
                    Zoom
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="icon"
              className="hover:bg-destructive/20 hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-6">
        <div 
          className={`w-full h-full max-w-[95vw] transition-all duration-500 ${getTransitionClass()}`}
        >
          {isQuizSlide && quizQuestions.length > 0 ? (
            /* Quiz Slide Layout */
            <QuizSlide
              title={slide.title}
              imageUrl={slide.imageUrl}
              questions={quizQuestions}
            />
          ) : (
            /* Regular Slide Layout */
            <div className="h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl p-3 md:p-4 flex flex-col overflow-hidden">
              {/* Title */}
              <div className="mb-2 md:mb-3 flex-shrink-0 animate-slide-in-right">
                <h1 className={`${getTitleSize()} font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-1 md:mb-2 break-words text-shadow-md`}>
                  {slide.title}
                </h1>
                <div className="h-1.5 w-28 bg-gradient-to-r from-primary via-secondary to-accent rounded-full shadow-lg" />
              </div>

              {/* Content Area */}
              <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
              {/* Image Section - Hide for interactive activities */}
              {slide.imageUrl && !isInteractiveSlide && (
                <div className="w-[35%] md:w-[40%] flex-shrink-0 animate-scale-in flex items-start justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-xl border-2 border-primary/20 p-3 shadow-xl backdrop-blur-sm flex items-center justify-center overflow-hidden">
                    <img 
                      src={slide.imageUrl} 
                      alt={slide.title}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transform transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>
              )}
              
              {/* Text Content Section - Hide for interactive activities */}
              {!isInteractiveSlide && (
                <div className={`flex-1 overflow-y-auto ${getSpacing()} pr-2 ${slide.imageUrl ? '' : 'max-w-6xl mx-auto'}`}>
                {contentParts.map((part, index) => {
                  const isRevealed = revealedElements.has(index);
                  const isNext = !isRevealed && contentParts.slice(0, index).every((_, i) => revealedElements.has(i));
                  
                  return (
                    <div
                      key={index}
                      className={`transition-all duration-700 ease-out ${
                        isRevealed
                          ? "opacity-100 translate-y-0 scale-100 blur-0"
                          : "opacity-0 translate-y-8 scale-95 blur-sm"
                      }`}
                    >
                      <div 
                        className={`content-box ${getCardPadding()} ${getLineSpacing()} transition-all duration-300 cursor-pointer relative overflow-hidden ${
                          isNext 
                            ? "border-primary/40 shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-[1.02] animate-pulse before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:to-secondary/10 before:opacity-50" 
                            : isRevealed 
                            ? "border-border/50 shadow-lg hover:border-primary/40 hover:shadow-2xl hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/0 before:to-secondary/0 before:opacity-0 hover:before:opacity-30 before:transition-opacity" 
                            : "border-border/30"
                        }`}
                        onClick={() => handleCardClick(index)}
                      >
                        {isNext && (
                          <div className="flex items-center gap-3 text-primary text-xs md:text-sm font-bold mb-3 animate-pulse relative z-10 font-heading">
                            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></span>
                            <span className="w-2.5 h-2.5 bg-primary rounded-full -ml-4"></span>
                            Press SPACE or click to reveal
                          </div>
                        )}
                        <p className={`${getContentSize()} font-sans slide-content text-foreground break-words relative z-10`}>
                          {part}
                        </p>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
              
              {/* Interactive Activities - Full Screen when present */}
              {isInteractiveSlide && slide.activityInstructions && (
                <div className="flex-1 overflow-y-auto max-w-5xl mx-auto">
                  {(() => {
                    try {
                      const activityData = JSON.parse(slide.activityInstructions);
                      
                      if (activityData.type === 'matching' && activityData.pairs) {
                        return (
                          <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/40 rounded-lg p-6 animate-scale-in shadow-xl">
                            <MatchingActivity 
                              title="🎯 Matching Activity"
                              pairs={activityData.pairs}
                            />
                          </div>
                        );
                      }
                      
                      if (activityData.type === 'fillblank' && activityData.items) {
                        return (
                          <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/40 rounded-lg p-6 animate-scale-in shadow-xl">
                            <FillInTheBlankActivity 
                              title="✏️ Fill in the Blanks"
                              items={activityData.items}
                            />
                          </div>
                        );
                      }
                      
                      if (activityData.type === 'scramble' && activityData.words) {
                        return (
                          <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/40 rounded-lg p-6 animate-scale-in shadow-xl">
                            <WordScrambleActivity 
                              title="🔤 Word Scramble"
                              words={activityData.words}
                            />
                          </div>
                        );
                      }
                      
                      if (activityData.type === 'ordering' && activityData.items) {
                        return (
                          <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/40 rounded-lg p-6 animate-scale-in shadow-xl">
                            <SentenceOrderingActivity 
                              items={activityData.items}
                            />
                          </div>
                        );
                      }
                      
                      if (activityData.type === 'truefalse' && activityData.items) {
                        return (
                          <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/40 rounded-lg p-6 animate-scale-in shadow-xl">
                            <TrueFalseActivity 
                              items={activityData.items}
                            />
                          </div>
                        );
                      }
                      
                      if (activityData.type === 'dialogue' && activityData.lines) {
                        return (
                          <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/40 rounded-lg p-6 animate-scale-in shadow-xl">
                            <DialogueActivity 
                              lines={activityData.lines}
                              title={activityData.title}
                            />
                          </div>
                        );
                      }
                      
                      if (activityData.type === 'roleplay' && activityData.scenarios) {
                        return (
                          <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/40 rounded-lg p-6 animate-scale-in shadow-xl">
                            <RolePlayActivity 
                              scenarios={activityData.scenarios}
                            />
                          </div>
                        );
                      }
                    } catch (e) {
                      return null;
                    }
                  })()}
                </div>
              )}
            </div>

            {/* Activity Instructions - Only for non-interactive activities */}
            {slide.activityInstructions && !isInteractiveSlide && (
              <>
                {(() => {
                  try {
                    const activityData = JSON.parse(slide.activityInstructions);
                    
                    // Skip interactive activities (they're rendered in main content area)
                    if (['matching', 'fillblank', 'scramble', 'ordering', 'truefalse', 'dialogue', 'roleplay'].includes(activityData.type)) {
                      return null;
                    }
                  } catch (e) {
                    // If not JSON or parsing fails, render as regular text
                  }
                  
                  return (
                    <div className="mt-4 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-2 border-primary/40 rounded-lg p-4 animate-scale-in shadow-xl">
                      <h3 className="text-sm md:text-base lg:text-lg font-bold text-primary mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">✓</span>
                        Activity
                      </h3>
                      <p className="text-sm md:text-base text-foreground leading-relaxed break-words">{slide.activityInstructions}</p>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto">
          <Button
            onClick={prevSlide}
            disabled={currentSlide === 0 || isAnimating}
            variant="outline"
            size="lg"
            className="hover:bg-primary/10 hover:border-primary"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          {/* Progress Dots */}
          <div className="flex gap-2 mx-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => !isAnimating && setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-12 bg-primary"
                    : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1 || isAnimating}
            variant="outline"
            size="lg"
            className="hover:bg-primary/10 hover:border-primary"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Keyboard Hints */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          SPACE to reveal next • Arrow keys to navigate • ESC to exit
        </div>
      </div>
    </div>
  );
};
