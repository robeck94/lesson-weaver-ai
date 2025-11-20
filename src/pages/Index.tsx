import { useState } from "react";
import { Link } from "react-router-dom";
import { LessonInputForm } from "@/components/LessonInputForm";
import { LessonPreview } from "@/components/LessonPreview";
import { TeacherGuide } from "@/components/TeacherGuide";
import { ImageGenerator } from "@/components/ImageGenerator";
import { RemixOptions } from "@/components/RemixOptions";
import { LessonFeedback } from "@/components/LessonFeedback";
import { SettingsDialog } from "@/components/SettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Gamepad2, Star } from "lucide-react";
import { PromptTemplate } from "@/types/template";

export interface ImageValidation {
  isValid: boolean;
  confidence: number;
  issues: string[];
  recommendation: string;
}

export interface LessonSlide {
  slideNumber: number;
  stage: string;
  title: string;
  content: string;
  visualDescription: string;
  animationNotes?: string;
  activityInstructions?: string;
  timing?: string;
  imageUrl?: string;
  interactionPattern?: string;
  imageValidation?: ImageValidation;
}

export interface GeneratedLesson {
  lessonType: string;
  framework?: string;
  topic: string;
  cefrLevel: string;
  totalSlides: number;
  stages: string[];
  slides: LessonSlide[];
  teacherNotes: string;
}

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>();
  const [showFeedback, setShowFeedback] = useState(false);
  const [imageQualityScore, setImageQualityScore] = useState<number | undefined>();
  const { toast } = useToast();

  const handleGenerateLesson = async (topic: string, cefrLevel: string, template?: PromptTemplate) => {
    setIsGenerating(true);
    setGeneratedLesson(null);
    setCurrentTemplateId(template?.id);

    try {
      // Step 1: Generate lesson content
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { topic, cefrLevel, template }
      });

      if (error) {
        console.error('Error generating lesson:', error);
        
        if (error.message?.includes('429')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Credits Required",
            description: "Please add credits to your workspace to continue using AI features.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation Failed",
            description: "Failed to generate lesson. Please try again.",
            variant: "destructive",
          });
        }
        setIsGenerating(false);
        return;
      }

      if (data?.lesson) {
        const lesson = data.lesson;
        setGeneratedLesson(lesson);
        
        toast({
          title: "Lesson Generated!",
          description: `Created a ${lesson.totalSlides}-slide ${lesson.lessonType} lesson. Generating images...`,
        });

        // Step 2: Generate images for slides with visual descriptions
        const slidesWithImages = [...lesson.slides];
        let imagesGenerated = 0;

        for (let i = 0; i < lesson.slides.length; i++) {
          const slide = lesson.slides[i];
          
          if (slide.visualDescription) {
            try {
              const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-slide-image', {
                body: {
                  visualDescription: slide.visualDescription,
                  slideTitle: slide.title,
                  slideContent: slide.content,
                  retryAttempt: 0
                }
              });

              if (!imageError && imageData?.imageUrl) {
                slidesWithImages[i] = { ...slide, imageUrl: imageData.imageUrl };
                imagesGenerated++;
                // Update lesson with newly generated image
                setGeneratedLesson({ ...lesson, slides: [...slidesWithImages] });
              }
            } catch (err) {
              console.error(`Error generating image for slide ${i + 1}:`, err);
            }
          }
        }

        // Step 3: Validate generated images and auto-fix low-confidence ones
        if (imagesGenerated > 0) {
          toast({
            title: "Validating Images...",
            description: "Checking if images match the lesson content",
          });

          const slidesToRetry: number[] = [];

          for (let i = 0; i < slidesWithImages.length; i++) {
            const slide = slidesWithImages[i];
            
            if (slide.imageUrl) {
              try {
                const { data: validationData, error: validationError } = await supabase.functions.invoke('validate-slide-image', {
                  body: {
                    imageUrl: slide.imageUrl,
                    slideContent: slide.content,
                    visualDescription: slide.visualDescription,
                    slideTitle: slide.title
                  }
                });

                if (!validationError && validationData?.validation) {
                  slidesWithImages[i] = { 
                    ...slide, 
                    imageValidation: validationData.validation 
                  };
                  
                  // Mark for retry if validation failed or confidence is low
                  if (!validationData.validation.isValid || validationData.validation.confidence < 70) {
                    slidesToRetry.push(i);
                  }
                  
                  // Update lesson with validation results
                  setGeneratedLesson({ ...lesson, slides: [...slidesWithImages] });
                }
              } catch (err) {
                console.error(`Error validating image for slide ${i + 1}:`, err);
              }
            }
          }
        }

        if (imagesGenerated > 0) {
          toast({
            title: "Images Generated!",
            description: `Successfully generated ${imagesGenerated} slide illustrations.`,
          });
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemixLesson = async (remixInstruction: string) => {
    if (!generatedLesson) return;
    
    setIsRemixing(true);
    
    try {
      toast({
        title: "Remixing Lesson...",
        description: "Creating an enhanced version with your requested changes",
      });

      // Call generate-lesson with remix context
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { 
          topic: generatedLesson.topic,
          cefrLevel: generatedLesson.cefrLevel,
          remixInstruction,
          currentLesson: JSON.stringify(generatedLesson)
        }
      });

      if (error) {
        console.error('Error remixing lesson:', error);
        toast({
          title: "Remix Failed",
          description: "Failed to remix lesson. Please try again.",
          variant: "destructive",
        });
        setIsRemixing(false);
        return;
      }

      if (data?.lesson) {
        const lesson = data.lesson;
        setGeneratedLesson(lesson);
        
        toast({
          title: "Lesson Remixed!",
          description: `Created enhanced ${lesson.totalSlides}-slide lesson. Generating images...`,
        });

        // Generate images for the remixed lesson
        const slidesWithImages = [...lesson.slides];
        let imagesGenerated = 0;

        for (let i = 0; i < lesson.slides.length; i++) {
          const slide = lesson.slides[i];
          
          if (slide.visualDescription) {
            try {
              const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-slide-image', {
                body: {
                  visualDescription: slide.visualDescription,
                  slideTitle: slide.title,
                  slideContent: slide.content,
                  retryAttempt: 0
                }
              });

              if (!imageError && imageData?.imageUrl) {
                slidesWithImages[i] = { ...slide, imageUrl: imageData.imageUrl };
                imagesGenerated++;
                setGeneratedLesson({ ...lesson, slides: [...slidesWithImages] });
              }
            } catch (err) {
              console.error(`Error generating image for slide ${i + 1}:`, err);
            }
          }
        }

        toast({
          title: "Complete!",
          description: `Remixed lesson with ${imagesGenerated} images generated`,
        });
      }
    } catch (err) {
      console.error('Unexpected error during remix:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during remix. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Hero Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center shadow-medium">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ESL Lesson Generator
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Slide Creator</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SettingsDialog />
            <Link to="/game-templates">
              <Button variant="outline" size="sm" className="gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Game Templates</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground hidden sm:inline">Powered by AI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {!generatedLesson ? (
          <div className="animate-fade-up">
            {/* Hero Section */}
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
                Create Perfect ESL Lessons in Seconds
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Generate pedagogically sound, visually stunning lesson slides with AI. 
                Choose a topic, select your level, and watch magic happen.
              </p>
            </div>

            {/* Input Form */}
            <div className="max-w-2xl mx-auto">
              <LessonInputForm 
                onGenerate={handleGenerateLesson} 
                isGenerating={isGenerating}
              />
            </div>

            {/* Features Grid */}
            <div className="mt-16 grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🎯",
                  title: "Pedagogically Correct",
                  description: "Follows proven ESL teaching methodologies and lesson structures"
                },
                {
                  icon: "🎨",
                  title: "Visually Stunning",
                  description: "Beautiful, engaging slides with animations and visual elements"
                },
                {
                  icon: "⚡",
                  title: "Instantly Ready",
                  description: "Generate complete lessons in seconds, ready to teach"
                }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className="gradient-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-border/50"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {generatedLesson.topic}
                </h2>
                <p className="text-muted-foreground">
                  {generatedLesson.lessonType} • {generatedLesson.cefrLevel} • {generatedLesson.totalSlides} slides
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedback(true)}
                  className="gap-2"
                >
                  <Star className="w-4 h-4" />
                  Rate This Lesson
                </Button>
                <ImageGenerator 
                  slides={generatedLesson.slides}
                  onImagesGenerated={(slidesWithImages) => {
                    setGeneratedLesson({ ...generatedLesson, slides: slidesWithImages });
                  }}
                />
                <button
                  onClick={() => setGeneratedLesson(null)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  New Lesson
                </button>
              </div>
            </div>

            {/* Remix Options */}
            <RemixOptions onRemix={handleRemixLesson} isRemixing={isRemixing} />

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LessonPreview slides={generatedLesson.slides} />
              </div>
              <div>
                <TeacherGuide 
                  slides={generatedLesson.slides} 
                  teacherNotes={generatedLesson.teacherNotes}
                  lessonType={generatedLesson.lessonType}
                  framework={generatedLesson.framework}
                  stages={generatedLesson.stages}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Feedback Dialog */}
        {generatedLesson && (
          <LessonFeedback
            isOpen={showFeedback}
            onClose={() => setShowFeedback(false)}
            lessonTopic={generatedLesson.topic}
            cefrLevel={generatedLesson.cefrLevel}
            slidesCount={generatedLesson.totalSlides}
            templateId={currentTemplateId}
            imageQualityScore={imageQualityScore}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
