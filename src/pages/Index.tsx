import { useState } from "react";
import { LessonInputForm } from "@/components/LessonInputForm";
import { LessonPreview } from "@/components/LessonPreview";
import { TeacherGuide } from "@/components/TeacherGuide";
import { ImageGenerator } from "@/components/ImageGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, BookOpen } from "lucide-react";

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
}

export interface GeneratedLesson {
  lessonType: string;
  topic: string;
  cefrLevel: string;
  totalSlides: number;
  stages: string[];
  slides: LessonSlide[];
  teacherNotes: string;
}

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);
  const { toast } = useToast();

  const handleGenerateLesson = async (topic: string, cefrLevel: string) => {
    setIsGenerating(true);
    setGeneratedLesson(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { topic, cefrLevel }
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
        return;
      }

      if (data?.lesson) {
        setGeneratedLesson(data.lesson);
        toast({
          title: "Lesson Generated!",
          description: `Created a ${data.lesson.totalSlides}-slide ${data.lesson.lessonType} lesson.`,
        });
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
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground hidden sm:inline">Powered by AI</span>
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

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LessonPreview slides={generatedLesson.slides} />
              </div>
              <div>
                <TeacherGuide 
                  slides={generatedLesson.slides} 
                  teacherNotes={generatedLesson.teacherNotes}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
