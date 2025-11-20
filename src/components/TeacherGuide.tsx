import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, FileText, Users, User, UserCircle2, Users2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LessonSlide } from "@/pages/Index";
import { useSettings } from "@/contexts/SettingsContext";

interface TeacherGuideProps {
  slides: LessonSlide[];
  teacherNotes: string;
  lessonType?: string;
  framework?: string;
  stages?: string[];
}

export const TeacherGuide = ({ slides, teacherNotes, lessonType, framework, stages }: TeacherGuideProps) => {
  const { toast } = useToast();
  const { getFontSizeClass } = useSettings();

  const handleExportPDF = () => {
    toast({
      title: "Export Coming Soon",
      description: "PDF export feature will be available in the next update!",
    });
  };

  const getInteractionIcon = (pattern?: string) => {
    switch (pattern) {
      case "Individual":
        return <User className="w-3 h-3" />;
      case "Pairs":
        return <Users2 className="w-3 h-3" />;
      case "Small Groups":
        return <Users className="w-3 h-3" />;
      case "Whole Class":
        return <UserCircle2 className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getSTTEstimate = (pattern?: string) => {
    switch (pattern) {
      case "Pairs":
        return "80-90% STT";
      case "Small Groups":
        return "70-80% STT";
      case "Whole Class":
        return "20-40% STT";
      case "Individual":
        return "0% STT (prep)";
      default:
        return "";
    }
  };

  // Calculate overall interaction pattern distribution
  const patternCounts = slides.reduce((acc, slide) => {
    const pattern = slide.interactionPattern || "Unknown";
    acc[pattern] = (acc[pattern] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

            {/* STT Distribution Summary */}
            {Object.keys(patternCounts).length > 0 && (
              <div className="bg-accent/10 rounded-lg p-3 space-y-2">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Interaction Pattern Distribution
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(patternCounts).map(([pattern, count]) => (
                    <div key={pattern} className="flex items-center gap-2">
                      {getInteractionIcon(pattern)}
                      <span className="text-muted-foreground">{pattern}:</span>
                      <span className="font-medium text-foreground">{count} slides</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic mt-2">
                  Target: 50% Pairs, 20% Groups, 20% Whole Class, 10% Individual
                </p>
              </div>
            )}

            {/* Overall Notes */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Lesson Overview
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className={`${getFontSizeClass()} text-foreground leading-relaxed whitespace-pre-wrap font-medium`}>
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
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {slide.slideNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-foreground">{slide.title}</h4>
                          {slide.interactionPattern && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">
                              {getInteractionIcon(slide.interactionPattern)}
                              <span>{slide.interactionPattern}</span>
                            </div>
                          )}
                          {slide.interactionPattern && (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                              {getSTTEstimate(slide.interactionPattern)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {slide.activityInstructions && (
                      <div className="text-xs space-y-1 pl-8">
                        <p className="text-muted-foreground font-medium">Instructions:</p>
                        <p className={`${getFontSizeClass()} text-foreground font-medium`}>{slide.activityInstructions}</p>
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
