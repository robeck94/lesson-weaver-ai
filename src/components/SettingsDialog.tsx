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
import { Settings, Type } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const FONT_SIZES = [
  { value: 'small', label: 'Small', size: 0 },
  { value: 'medium', label: 'Medium', size: 1 },
  { value: 'large', label: 'Large', size: 2 },
  { value: 'extra-large', label: 'Extra Large', size: 3 },
] as const;

export function SettingsDialog() {
  const { fontSize, setFontSize } = useSettings();
  const [open, setOpen] = useState(false);

  const currentSizeIndex = FONT_SIZES.findIndex(fs => fs.value === fontSize);

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Display Settings
          </DialogTitle>
          <DialogDescription>
            Adjust text size for optimal classroom visibility
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Font Size Control */}
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

            {/* Size Labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              {FONT_SIZES.map((size) => (
                <span key={size.value}>{size.label}</span>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview:</Label>
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <p className={`${FONT_SIZES[currentSizeIndex].value === 'small' ? 'text-base' : FONT_SIZES[currentSizeIndex].value === 'medium' ? 'text-lg' : FONT_SIZES[currentSizeIndex].value === 'large' ? 'text-xl' : 'text-2xl'} font-semibold text-foreground`}>
                The quick brown fox jumps over the lazy dog.
              </p>
              <p className={`${FONT_SIZES[currentSizeIndex].value === 'small' ? 'text-sm' : FONT_SIZES[currentSizeIndex].value === 'medium' ? 'text-base' : FONT_SIZES[currentSizeIndex].value === 'large' ? 'text-lg' : 'text-xl'} text-muted-foreground mt-2`}>
                This is how lesson content will appear.
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-accent/50 rounded-lg p-3">
            <p className="font-medium mb-1">💡 Tip for teachers:</p>
            <p>Increase text size for projector displays or students with visual needs. Decrease for tablets or close-up viewing.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
