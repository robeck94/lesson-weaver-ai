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
    
    const MAX_RETRIES = 2; // Maximum retry attempts for fixing issues
    
    try {
      const updatedSlides = [...slides];
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // Skip if slide already has an image or no visual description
        if (slide.imageUrl || !slide.visualDescription) {
          setProgress(((i + 1) / slides.length) * 100);
          continue;
        }

        let imageGenerated = false;
        let retryAttempt = 0;
        let lastValidation: any = null;

        // Retry loop for automatic fixing
        while (!imageGenerated && retryAttempt <= MAX_RETRIES) {
          try {
            // Generate image with retry context
            const { data: genData, error: genError } = await supabase.functions.invoke('generate-slide-image', {
              body: {
                visualDescription: slide.visualDescription,
                slideTitle: slide.title,
                slideContent: slide.content,
                validationIssues: lastValidation?.issues || [],
                retryAttempt
              }
            });

            if (genError) {
              console.error(`Error generating image for slide ${i + 1}:`, genError);
              break; // Stop retrying on generation errors
            }

            if (!genData?.imageUrl) {
              break; // No image generated, stop retrying
            }

            // Validate the generated image
            const { data: valData } = await supabase.functions.invoke('validate-slide-image', {
              body: {
                imageUrl: genData.imageUrl,
                slideTitle: slide.title,
                slideContent: slide.content,
                visualDescription: slide.visualDescription
              }
            });

            // Check validation results
            if (valData?.validation?.isValid) {
              // Image is valid, accept it
              updatedSlides[i] = { 
                ...slide, 
                imageUrl: genData.imageUrl,
                imageValidation: valData.validation
              };
              imageGenerated = true;
            } else if (retryAttempt < MAX_RETRIES) {
              // Image has issues and we have retries left
              console.log(`Validation failed for slide ${i + 1}, retrying (attempt ${retryAttempt + 1}/${MAX_RETRIES})...`);
              lastValidation = valData?.validation;
              retryAttempt++;
              // Continue to next iteration to retry
            } else {
              // Max retries reached, accept the image but keep validation warnings
              console.log(`Max retries reached for slide ${i + 1}, accepting image with warnings`);
              updatedSlides[i] = { 
                ...slide, 
                imageUrl: genData.imageUrl,
                imageValidation: valData?.validation
              };
              imageGenerated = true;
            }

          } catch (err) {
            console.error(`Error in image generation/validation loop for slide ${i + 1}:`, err);
            break; // Stop retrying on unexpected errors
          }
        }

        if (!imageGenerated) {
          toast({
            title: `Failed to generate image for slide ${i + 1}`,
            description: "Continuing with other slides...",
            variant: "destructive",
          });
        }

        setProgress(((i + 1) / slides.length) * 100);
      }

      onImagesGenerated(updatedSlides);
      
      const successCount = updatedSlides.filter(s => s.imageUrl).length;
      const issuesCount = updatedSlides.filter(s => s.imageValidation && !s.imageValidation.isValid).length;
      
      toast({
        title: "Images Generated!",
        description: `Successfully generated ${successCount} images${issuesCount > 0 ? ` (${issuesCount} with minor issues)` : ''}.`,
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
