import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface GameTemplate {
  id: string;
  name: string;
  type: "bingo" | "board" | "cards" | "matching" | "memory";
  requiredItems: number;
  minItems?: number;
  maxItems?: number;
}

interface GameCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: GameTemplate | null;
}

export const GameCustomizer = ({ open, onOpenChange, template }: GameCustomizerProps) => {
  const [gameTitle, setGameTitle] = useState("");
  const [items, setItems] = useState<string[]>([""]);
  const [topic, setTopic] = useState("");
  const [cefrLevel, setcefrLevel] = useState("A2");

  const handleAddItem = () => {
    if (template?.maxItems && items.length >= template.maxItems) {
      toast.error(`Maximum ${template.maxItems} items allowed`);
      return;
    }
    setItems([...items, ""]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= (template?.minItems || 1)) {
      toast.error(`Minimum ${template?.minItems || 1} items required`);
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleGenerateWithAI = () => {
    toast.info("AI generation coming soon!", {
      description: "This feature will auto-generate content based on your topic and level"
    });
  };

  const handleGenerate = () => {
    const validItems = items.filter(item => item.trim());
    
    if (!gameTitle.trim()) {
      toast.error("Please enter a game title");
      return;
    }

    if (validItems.length < (template?.minItems || template?.requiredItems || 1)) {
      toast.error(`Please add at least ${template?.minItems || template?.requiredItems} items`);
      return;
    }

    toast.success("Game generated!", {
      description: "Your game is ready. Download option coming soon!"
    });
  };

  if (!template) return null;

  const getItemLabel = () => {
    switch (template.type) {
      case "bingo": return "Bingo Words/Phrases";
      case "cards": return "Flash Card Content";
      case "board": return "Board Game Questions";
      case "matching": return "Matching Pairs";
      case "memory": return "Memory Card Pairs";
      default: return "Items";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Customize {template.name}
          </DialogTitle>
          <DialogDescription>
            Fill in your content to generate a ready-to-use game for your ESL class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Game Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">Game Title</Label>
            <Input
              id="title"
              placeholder="e.g., Present Simple Bingo, Food Vocabulary Cards"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className="text-base"
            />
          </div>

          {/* AI Generation Option */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-2">✨ Auto-Generate with AI</h4>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <Label htmlFor="topic" className="text-xs">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Food"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level" className="text-xs">CEFR Level</Label>
                    <Select value={cefrLevel} onValueChange={setcefrLevel}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1">A1</SelectItem>
                        <SelectItem value="A2">A2</SelectItem>
                        <SelectItem value="B1">B1</SelectItem>
                        <SelectItem value="B2">B2</SelectItem>
                        <SelectItem value="C1">C1</SelectItem>
                        <SelectItem value="C2">C2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateWithAI}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
              </div>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">{getItemLabel()}</Label>
              <Badge variant="secondary">
                {items.filter(i => i.trim()).length} / {template.requiredItems || template.maxItems || "∞"}
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Item ${index + 1}`}
                      value={item}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  {items.length > (template?.minItems || 1) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleAddItem}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={template?.maxItems ? items.length >= template.maxItems : false}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Item
            </Button>
          </div>

          {/* Game Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <h4 className="font-semibold mb-2">📝 How to Play:</h4>
            <p className="text-muted-foreground">{getInstructions(template.type)}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate & Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getInstructions = (type: string): string => {
  const instructions = {
    bingo: "Give each student a bingo card. Call out words randomly. Students mark the words they hear. First to get 5 in a row wins!",
    cards: "Print and cut out the flashcards. Use for drilling, matching games, or memory activities. Show the front and elicit the meaning.",
    board: "Students move around the board by answering questions correctly. First to reach the end wins! Use dice or spinner for movement.",
    matching: "Cut out the cards and have students match pairs (word to definition, question to answer, etc.). Can be played individually or in teams.",
    memory: "Place all cards face down. Students take turns flipping two cards to find matching pairs. Most pairs wins!",
  };
  return instructions[type as keyof typeof instructions] || "Follow the game instructions provided.";
};
