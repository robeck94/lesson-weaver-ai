import { useState } from "react";
import { LessonSlide } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X, ChevronLeft, ChevronRight } from "lucide-react";

interface SlideEditorProps {
  slides: LessonSlide[];
  currentSlideIndex: number;
  onSave: (slides: LessonSlide[]) => void;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const STAGE_OPTIONS = [
  "Lead-in",
  "Presentation",
  "Practice",
  "Production",
  "Consolidation",
  "Review"
];

const LAYOUT_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "text-heavy", label: "Text Heavy" },
  { value: "image-focused", label: "Image Focused" },
  { value: "split", label: "Split Layout" },
  { value: "example-grid", label: "Example Grid" }
];

export const SlideEditor = ({ 
  slides, 
  currentSlideIndex, 
  onSave, 
  onClose,
  onNavigate 
}: SlideEditorProps) => {
  const [editedSlides, setEditedSlides] = useState<LessonSlide[]>([...slides]);
  const currentSlide = editedSlides[currentSlideIndex];

  const updateCurrentSlide = (field: keyof LessonSlide, value: string) => {
    const updated = [...editedSlides];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      [field]: value
    };
    setEditedSlides(updated);
  };

  const handleSave = () => {
    onSave(editedSlides);
    onClose();
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      onNavigate(currentSlideIndex - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < editedSlides.length - 1) {
      onNavigate(currentSlideIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Edit Slide {currentSlideIndex + 1} of {editedSlides.length}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevSlide}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextSlide}
                disabled={currentSlideIndex === editedSlides.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save All Changes
            </Button>
            <Button onClick={onClose} variant="outline" className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Slide Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Slide Title</Label>
              <Input
                id="title"
                value={currentSlide.title}
                onChange={(e) => updateCurrentSlide("title", e.target.value)}
                placeholder="Enter slide title"
                className="text-lg font-semibold"
              />
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={currentSlide.stage}
                onValueChange={(value) => updateCurrentSlide("stage", value)}
              >
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Layout */}
            <div className="space-y-2">
              <Label htmlFor="layout">Layout</Label>
              <Select
                value={(currentSlide as any).layout || "standard"}
                onValueChange={(value) => updateCurrentSlide("layout" as keyof LessonSlide, value)}
              >
                <SelectTrigger id="layout">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUT_OPTIONS.map((layout) => (
                    <SelectItem key={layout.value} value={layout.value}>
                      {layout.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={currentSlide.content}
                onChange={(e) => updateCurrentSlide("content", e.target.value)}
                placeholder="Enter slide content (use line breaks to separate points)"
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Each line will be displayed as a separate content card
              </p>
            </div>

            {/* Visual Description */}
            <div className="space-y-2">
              <Label htmlFor="visualDescription">Visual Description</Label>
              <Textarea
                id="visualDescription"
                value={currentSlide.visualDescription}
                onChange={(e) => updateCurrentSlide("visualDescription", e.target.value)}
                placeholder="Describe the visual elements for this slide"
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Used for generating images (if applicable)
              </p>
            </div>

            {/* Timing */}
            <div className="space-y-2">
              <Label htmlFor="timing">Timing</Label>
              <Input
                id="timing"
                value={currentSlide.timing || ""}
                onChange={(e) => updateCurrentSlide("timing", e.target.value)}
                placeholder="e.g., 5-7 min"
              />
            </div>

            {/* Activity Instructions */}
            <div className="space-y-2">
              <Label htmlFor="activityInstructions">Activity Instructions (JSON)</Label>
              <Textarea
                id="activityInstructions"
                value={currentSlide.activityInstructions || ""}
                onChange={(e) => updateCurrentSlide("activityInstructions", e.target.value)}
                placeholder='{"type": "matching", "pairs": [...]}'
                className="min-h-[120px] font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                For interactive activities, enter valid JSON data
              </p>
            </div>

            {/* Animation Notes */}
            <div className="space-y-2">
              <Label htmlFor="animationNotes">Animation Notes</Label>
              <Textarea
                id="animationNotes"
                value={currentSlide.animationNotes || ""}
                onChange={(e) => updateCurrentSlide("animationNotes", e.target.value)}
                placeholder="Notes about animations or transitions"
                className="min-h-[60px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-6 border-2 border-border">
              <div className="mb-4">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 mb-2">
                  {currentSlide.stage}
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {currentSlide.title}
                </h3>
              </div>
              <div className="space-y-2">
                {currentSlide.content.split('\n').filter(line => line.trim()).map((line, idx) => (
                  <div key={idx} className="bg-card/50 p-3 rounded-lg border border-border/50">
                    <p className="text-foreground">{line}</p>
                  </div>
                ))}
              </div>
              {currentSlide.timing && (
                <div className="mt-4 text-sm text-muted-foreground">
                  ⏱️ {currentSlide.timing}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
