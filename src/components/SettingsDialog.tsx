import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings, Type, Palette, Sparkles } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const FONT_SIZES = [
  { value: 'small', label: 'Small', size: 0 },
  { value: 'medium', label: 'Medium', size: 1 },
  { value: 'large', label: 'Large', size: 2 },
  { value: 'extra-large', label: 'Extra Large', size: 3 },
] as const;

const FONT_FAMILIES = [
  { value: 'inter', label: 'Inter', preview: 'Modern and clean', class: 'font-sans' },
  { value: 'roboto', label: 'Roboto', preview: 'Clear and friendly', class: 'font-roboto' },
  { value: 'open-sans', label: 'Open Sans', preview: 'Professional', class: 'font-opensans' },
  { value: 'merriweather', label: 'Merriweather', preview: 'Classic serif', class: 'font-merriweather' },
  { value: 'playfair', label: 'Playfair Display', preview: 'Elegant serif', class: 'font-playfair' },
] as const;

const PRESENTATION_THEMES = [
  { value: 'default', label: 'Default', colors: ['#3B82F6', '#8B5CF6', '#EC4899'], description: 'Balanced and vibrant' },
  { value: 'modern', label: 'Modern', colors: ['#3B82F6', '#A855F7', '#EC4899'], description: 'Bold blue to pink' },
  { value: 'elegant', label: 'Elegant', colors: ['#D97706', '#E11D48', '#9333EA'], description: 'Warm and sophisticated' },
  { value: 'playful', label: 'Playful', colors: ['#22C55E', '#FACC15', '#F97316'], description: 'Bright and energetic' },
  { value: 'minimal', label: 'Minimal', colors: ['#6B7280', '#9CA3AF', '#D1D5DB'], description: 'Clean grayscale' },
] as const;

export function SettingsDialog() {
  const { 
    fontSize, 
    setFontSize, 
    fontFamily, 
    setFontFamily,
    presentationTheme,
    setPresentationTheme,
  } = useSettings();
  const [open, setOpen] = useState(false);

  const currentSizeIndex = FONT_SIZES.findIndex(fs => fs.value === fontSize);
  const currentFont = FONT_FAMILIES.find(f => f.value === fontFamily);

  const handleSliderChange = (value: number[]) => {
    const newSize = FONT_SIZES[value[0]];
    if (newSize) {
      setFontSize(newSize.value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-border hover:bg-accent"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Customize Your Experience
          </DialogTitle>
          <DialogDescription>
            Personalize text size, fonts, and presentation themes for optimal classroom display
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="fonts" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Fonts
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Themes
            </TabsTrigger>
          </TabsList>

          {/* Text Size Tab */}
          <TabsContent value="text" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Type className="h-4 w-4 text-primary" />
                  Text Size
                </Label>
                <span className="text-sm font-medium text-primary">
                  {FONT_SIZES[currentSizeIndex].label}
                </span>
              </div>

              <Slider
                value={[currentSizeIndex]}
                onValueChange={handleSliderChange}
                min={0}
                max={3}
                step={1}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                {FONT_SIZES.map((size) => (
                  <span key={size.value}>{size.label}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview:</Label>
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <p className={`${FONT_SIZES[currentSizeIndex].value === 'small' ? 'text-base' : FONT_SIZES[currentSizeIndex].value === 'medium' ? 'text-lg' : FONT_SIZES[currentSizeIndex].value === 'large' ? 'text-xl' : 'text-2xl'} font-semibold text-foreground`}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Font Family Tab */}
          <TabsContent value="fonts" className="space-y-6 py-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Choose Font Family</Label>
              <RadioGroup value={fontFamily} onValueChange={(value) => setFontFamily(value as any)}>
                {FONT_FAMILIES.map((font) => (
                  <div key={font.value} className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value={font.value} id={font.value} />
                    <Label
                      htmlFor={font.value}
                      className="flex-1 cursor-pointer"
                    >
                      <div className={`${font.class} p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors ${fontFamily === font.value ? 'border-primary bg-primary/5' : ''}`}>
                        <div className="font-semibold text-lg mb-1">{font.label}</div>
                        <div className="text-sm text-muted-foreground">{font.preview}</div>
                        <div className="text-base mt-2">The quick brown fox jumps over the lazy dog</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>

          {/* Presentation Themes Tab */}
          <TabsContent value="themes" className="space-y-6 py-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Presentation Theme</Label>
              <RadioGroup value={presentationTheme} onValueChange={(value) => setPresentationTheme(value as any)}>
                {PRESENTATION_THEMES.map((theme) => (
                  <div key={theme.value} className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value={theme.value} id={theme.value} />
                    <Label
                      htmlFor={theme.value}
                      className="flex-1 cursor-pointer"
                    >
                      <div className={`p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors ${presentationTheme === theme.value ? 'border-primary bg-primary/5' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-base">{theme.label}</div>
                          <div className="flex gap-1">
                            {theme.colors.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{theme.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="text-xs text-muted-foreground bg-accent/50 rounded-lg p-3">
              <p className="font-medium mb-1">💡 Note:</p>
              <p>Themes apply to full-screen presentation mode for an immersive teaching experience</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground bg-accent/50 rounded-lg p-3">
          <p className="font-medium mb-1">💡 Tip for teachers:</p>
          <p>Adjust settings based on your classroom setup, projector quality, and student needs. Changes save automatically!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
