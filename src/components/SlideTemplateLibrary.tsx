import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SlideTemplate, SLIDE_TEMPLATES } from "@/types/slideTemplate";
import { Check } from "lucide-react";

interface SlideTemplateLibraryProps {
  onSelectTemplate: (template: SlideTemplate) => void;
  currentTemplateId?: string;
}

export const SlideTemplateLibrary = ({ onSelectTemplate, currentTemplateId }: SlideTemplateLibraryProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Slide Templates</CardTitle>
        <CardDescription>Choose a pre-designed layout for your slide</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SLIDE_TEMPLATES.map((template) => {
              const isSelected = template.id === currentTemplateId;
              
              return (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`group relative p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div className="text-4xl mb-3 text-center">{template.thumbnail}</div>
                  
                  <div className="text-left">
                    <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
