import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { LessonSlide } from "@/pages/Index";

interface ImageGeneratorProps {
  slides: LessonSlide[];
  onImagesGenerated: (slidesWithImages: LessonSlide[]) => void;
}

export const ImageGenerator = ({ slides, onImagesGenerated }: ImageGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generateImages = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      const updatedSlides = [...slides];
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // Skip if slide already has an image or no visual description
        if (slide.imageUrl || !slide.visualDescription) {
          setProgress(((i + 1) / slides.length) * 100);
          continue;
        }

        try {
          const { data, error } = await supabase.functions.invoke('generate-slide-image', {
            body: {
              visualDescription: slide.visualDescription,
              slideTitle: slide.title
            }
          });

          if (error) {
            console.error(`Error generating image for slide ${i + 1}:`, error);
            toast({
              title: `Failed to generate image for slide ${i + 1}`,
              description: "Continuing with other slides...",
              variant: "destructive",
            });
          } else if (data?.imageUrl) {
            updatedSlides[i] = { ...slide, imageUrl: data.imageUrl };
          }
        } catch (err) {
          console.error(`Error generating image for slide ${i + 1}:`, err);
        }

        setProgress(((i + 1) / slides.length) * 100);
      }

      onImagesGenerated(updatedSlides);
      
      toast({
        title: "Images Generated!",
        description: `Successfully generated ${updatedSlides.filter(s => s.imageUrl).length} slide illustrations.`,
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during image generation.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const hasImagesGenerated = slides.some(s => s.imageUrl);

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={generateImages}
        disabled={isGenerating}
        className="bg-gradient-to-r from-accent to-secondary hover:opacity-90 text-white"
        size="sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating {Math.round(progress)}%
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            {hasImagesGenerated ? 'Regenerate' : 'Generate'} Images
          </>
        )}
      </Button>
      {hasImagesGenerated && (
        <span className="text-sm text-muted-foreground">
          ✓ Images generated
        </span>
      )}
    </div>
  );
};
