import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LessonSlide } from "@/pages/Index";

interface TeacherGuideProps {
  slides: LessonSlide[];
  teacherNotes: string;
  lessonType?: string;
  framework?: string;
  stages?: string[];
}

export const TeacherGuide = ({ slides, teacherNotes, lessonType, framework, stages }: TeacherGuideProps) => {
  const { toast } = useToast();

  const handleExportPDF = () => {
    toast({
      title: "Export Coming Soon",
      description: "PDF export feature will be available in the next update!",
    });
  };

  return (
    <Card className="shadow-medium border-border/50 h-full">
      <CardHeader className="gradient-card border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BookOpen className="w-5 h-5 text-secondary" />
          Teacher Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[520px]">
          <div className="p-6 space-y-6">
            {/* Framework Information */}
            {(lessonType || framework) && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {lessonType && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {lessonType} Lesson
                    </span>
                  )}
                  {framework && (
                    <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                      Framework: {framework}
                    </span>
                  )}
                </div>
                {stages && stages.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Stages: {stages.join(' → ')}
                  </div>
                )}
              </div>
            )}

            {/* Overall Notes */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Lesson Overview
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {teacherNotes}
                </p>
              </div>
            </div>

            {/* Slide-by-Slide Instructions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Slide Instructions</h3>
              <div className="space-y-3">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4 bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {slide.slideNumber}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground">{slide.title}</h4>
                      {slide.interactionPattern && (
                        <span className="ml-auto px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">
                          {slide.interactionPattern}
                        </span>
                      )}
                    </div>
                    
                    {slide.activityInstructions && (
                      <div className="text-xs space-y-1 pl-8">
                        <p className="text-muted-foreground font-medium">Instructions:</p>
                        <p className="text-foreground">{slide.activityInstructions}</p>
                      </div>
                    )}
                    
                    {slide.timing && (
                      <p className="text-xs text-muted-foreground pl-8">
                        ⏱️ Suggested time: {slide.timing}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Export Button */}
        <div className="p-4 border-t border-border">
          <Button 
            onClick={handleExportPDF}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
