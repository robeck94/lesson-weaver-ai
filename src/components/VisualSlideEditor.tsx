import { useState, useRef } from "react";
import { LessonSlide } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, X, ChevronLeft, ChevronRight, Plus, Trash2, 
  Upload, Image as ImageIcon, Type, ZoomIn, ZoomOut,
  Move, Maximize2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface VisualSlideEditorProps {
  slides: LessonSlide[];
  currentSlideIndex: number;
  onSave: (slides: LessonSlide[]) => void;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const STAGE_OPTIONS = [
  "Lead-in", "Presentation", "Practice", 
  "Production", "Consolidation", "Review"
];

const LAYOUT_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "text-heavy", label: "Text Heavy" },
  { value: "image-focused", label: "Image Focused" },
  { value: "split", label: "Split Layout" },
  { value: "example-grid", label: "Example Grid" }
];

export const VisualSlideEditor = ({ 
  slides, 
  currentSlideIndex, 
  onSave, 
  onClose,
  onNavigate 
}: VisualSlideEditorProps) => {
  const [editedSlides, setEditedSlides] = useState<LessonSlide[]>([...slides]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [contentBoxScale, setContentBoxScale] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const currentSlide = editedSlides[currentSlideIndex];

  const updateCurrentSlide = (field: keyof LessonSlide, value: any) => {
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

  const handleAddSlide = () => {
    const newSlide: LessonSlide = {
      slideNumber: editedSlides.length + 1,
      stage: "Practice",
      title: "New Slide",
      content: "Click to edit content",
      visualDescription: "Custom slide",
      timing: "5 min"
    };
    
    const updated = [...editedSlides];
    updated.splice(currentSlideIndex + 1, 0, newSlide);
    
    // Renumber slides
    updated.forEach((slide, idx) => {
      slide.slideNumber = idx + 1;
    });
    
    setEditedSlides(updated);
    onNavigate(currentSlideIndex + 1);
    
    toast({
      title: "Slide Added",
      description: "New slide created after current slide",
    });
  };

  const handleDeleteSlide = () => {
    if (editedSlides.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Lesson must have at least one slide",
        variant: "destructive",
      });
      return;
    }

    const updated = editedSlides.filter((_, idx) => idx !== currentSlideIndex);
    
    // Renumber slides
    updated.forEach((slide, idx) => {
      slide.slideNumber = idx + 1;
    });
    
    setEditedSlides(updated);
    
    // Navigate to previous slide or first slide
    const newIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : 0;
    onNavigate(newIndex);
    
    toast({
      title: "Slide Deleted",
      description: "Slide removed from lesson",
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5242880) {
      toast({
        title: "File Too Large",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG, PNG, GIF, or WEBP image",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slide-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('slide-images')
        .getPublicUrl(filePath);

      updateCurrentSlide("imageUrl", publicUrl);

      toast({
        title: "Image Uploaded",
        description: "Custom image added to slide",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    updateCurrentSlide("imageUrl", undefined);
    toast({
      title: "Image Removed",
      description: "Image removed from slide",
    });
  };

  const handleDuplicateSlide = () => {
    const duplicatedSlide = {
      ...currentSlide,
      slideNumber: currentSlideIndex + 2,
      title: `${currentSlide.title} (Copy)`
    };
    
    const updated = [...editedSlides];
    updated.splice(currentSlideIndex + 1, 0, duplicatedSlide);
    
    // Renumber slides
    updated.forEach((slide, idx) => {
      slide.slideNumber = idx + 1;
    });
    
    setEditedSlides(updated);
    onNavigate(currentSlideIndex + 1);
    
    toast({
      title: "Slide Duplicated",
      description: "Slide copied successfully",
    });
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Visual Editor - Slide {currentSlideIndex + 1} of {editedSlides.length}
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
              Save All
            </Button>
            <Button onClick={onClose} variant="outline" className="gap-2">
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
        </div>

        {/* Slide Management Toolbar */}
        <div className="flex gap-2 mb-6 p-4 bg-muted/50 rounded-lg border">
          <Button onClick={handleAddSlide} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Slide
          </Button>
          <Button onClick={handleDuplicateSlide} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Duplicate
          </Button>
          <Button 
            onClick={handleDeleteSlide} 
            variant="outline" 
            className="gap-2 hover:bg-destructive/10 hover:text-destructive"
            disabled={editedSlides.length <= 1}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[contentBoxScale]}
              onValueChange={(values) => setContentBoxScale(values[0])}
              min={50}
              max={150}
              step={10}
              className="w-32"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
              {contentBoxScale}%
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-4">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">
                  <Type className="w-4 h-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="image">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Move className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
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

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="content">Content</Label>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="fontSize" className="text-xs text-muted-foreground">
                            Font Size:
                          </Label>
                          <Input
                            id="fontSize"
                            type="number"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-16 h-8"
                            min="12"
                            max="32"
                          />
                        </div>
                      </div>
                      <Textarea
                        id="content"
                        value={currentSlide.content}
                        onChange={(e) => updateCurrentSlide("content", e.target.value)}
                        placeholder="Enter slide content (each line = separate box)"
                        className="min-h-[300px]"
                        style={{ fontSize: `${fontSize}px` }}
                      />
                      <p className="text-xs text-muted-foreground">
                        💡 Tip: Each line creates a separate content box in the preview
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Slide Image</Label>
                      {currentSlide.imageUrl ? (
                        <div className="space-y-2">
                          <div className="relative group rounded-lg overflow-hidden border-2 border-border">
                            <img 
                              src={currentSlide.imageUrl} 
                              alt="Slide" 
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="secondary"
                                size="sm"
                                className="gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                Replace
                              </Button>
                              <Button
                                onClick={handleRemoveImage}
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Click to upload custom image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, GIF, or WEBP (max 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visualDescription">Visual Description</Label>
                      <Textarea
                        id="visualDescription"
                        value={currentSlide.visualDescription}
                        onChange={(e) => updateCurrentSlide("visualDescription", e.target.value)}
                        placeholder="Describe visual elements (for future AI regeneration)"
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="timing">Timing</Label>
                      <Input
                        id="timing"
                        value={currentSlide.timing || ""}
                        onChange={(e) => updateCurrentSlide("timing", e.target.value)}
                        placeholder="e.g., 5-7 min"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activityInstructions">Activity Instructions (JSON)</Label>
                      <Textarea
                        id="activityInstructions"
                        value={currentSlide.activityInstructions || ""}
                        onChange={(e) => updateCurrentSlide("activityInstructions", e.target.value)}
                        placeholder='{"type": "matching", "pairs": [...]}'
                        className="min-h-[120px] font-mono text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview Panel */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Maximize2 className="w-5 h-5 text-primary" />
                    Live Preview
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    Scale: {contentBoxScale}%
                  </div>
                </div>
                
                <div 
                  className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-6 border-2 border-border min-h-[500px] transition-all"
                  style={{ transform: `scale(${contentBoxScale / 100})`, transformOrigin: 'top center' }}
                >
                  {/* Stage Badge */}
                  <div className="mb-4">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                      {currentSlide.stage}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4"
                    style={{ fontSize: `${fontSize * 1.5}px` }}
                  >
                    {currentSlide.title}
                  </h3>

                  {/* Image */}
                  {currentSlide.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={currentSlide.imageUrl} 
                        alt={currentSlide.title}
                        className="w-full max-h-[200px] object-contain rounded-lg border border-border/50"
                      />
                    </div>
                  )}

                  {/* Content Boxes */}
                  <div className="space-y-3">
                    {currentSlide.content.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <div 
                        key={idx} 
                        className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <p 
                          className="text-foreground"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {line}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Timing */}
                  {currentSlide.timing && (
                    <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                      <span className="inline-block w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        ⏱️
                      </span>
                      {currentSlide.timing}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
