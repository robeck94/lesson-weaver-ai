import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { LessonSlide } from "@/pages/Index";
import { QuizSlide } from "./QuizSlide";

interface PresentationModeProps {
  slides: LessonSlide[];
  onClose: () => void;
}

export const PresentationMode = ({ slides, onClose }: PresentationModeProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedElements, setRevealedElements] = useState<Set<number>>(new Set());
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

      {/* Main Slide Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-6">
        <div 
          className={`w-full h-full max-w-[95vw] transition-all duration-500 ${
            isAnimating ? "animate-fade-in" : ""
          }`}
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
                <h1 className={`${getTitleSize()} font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-1 md:mb-2 break-words`}>
                  {slide.title}
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full" />
              </div>

              {/* Content Area */}
              <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
              {/* Image Section - Maximum Vertical Space */}
              {slide.imageUrl && (
                <div className="w-[35%] md:w-[40%] flex-shrink-0 animate-fade-in flex items-start justify-center overflow-hidden">
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title}
                    className="w-full h-auto max-h-[calc(100vh-140px)] object-contain rounded-xl shadow-2xl border-2 border-primary/30"
                  />
                </div>
              )}
              
              {/* Text Content Section */}
              <div className={`flex-1 overflow-y-auto ${getSpacing()} pr-2 ${slide.imageUrl ? '' : 'max-w-6xl mx-auto'}`}>
                {contentParts.map((part, index) => {
                  const isRevealed = revealedElements.has(index);
                  const isNext = !isRevealed && contentParts.slice(0, index).every((_, i) => revealedElements.has(i));
                  
                  return (
                    <div
                      key={index}
                      className={`transition-all duration-700 ease-out ${
                        isRevealed
                          ? "opacity-100 translate-y-0 scale-100"
                          : "opacity-0 translate-y-8 scale-95"
                      }`}
                    >
                      <div 
                        className={`bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-md rounded-lg ${getCardPadding()} border-2 transition-all duration-300 cursor-pointer ${
                          isNext 
                            ? "border-primary shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/50 hover-scale ring-4 ring-primary/40" 
                            : "border-border/50 hover:shadow-xl hover:border-primary/30"
                        }`}
                        onClick={() => handleCardClick(index)}
                      >
                        {isNext && (
                          <div className="flex items-center gap-3 text-primary text-xs md:text-sm font-semibold mb-3 animate-pulse">
                            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></span>
                            <span className="w-2.5 h-2.5 bg-primary rounded-full -ml-4"></span>
                            Press SPACE or click to reveal
                          </div>
                        )}
                        <p className={`${getContentSize()} ${getLineSpacing()} text-foreground font-medium whitespace-pre-wrap break-words`}>
                          {part}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Instructions */}
            {slide.activityInstructions && (
              <div className="mt-4 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-2 border-primary/40 rounded-lg p-4 animate-scale-in shadow-xl">
                <h3 className="text-sm md:text-base lg:text-lg font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">✓</span>
                  Activity
                </h3>
                <p className="text-sm md:text-base text-foreground leading-relaxed break-words">{slide.activityInstructions}</p>
              </div>
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
