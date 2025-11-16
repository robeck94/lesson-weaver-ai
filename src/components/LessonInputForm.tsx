import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface LessonInputFormProps {
  onGenerate: (topic: string, cefrLevel: string) => void;
  isGenerating: boolean;
}

const PRESET_TOPICS = [
  "Daily Routines",
  "Food and Restaurants",
  "Travel and Tourism",
  "Present Simple Tense",
  "Past Simple Tense",
  "Modal Verbs",
  "Conditional Sentences",
  "Business English - Meetings",
  "Job Interviews",
  "Environmental Issues",
  "Technology and Social Media",
  "Health and Fitness",
];

const CEFR_LEVELS = [
  { value: "A1", label: "A1 - Beginner" },
  { value: "A2", label: "A2 - Elementary" },
  { value: "B1", label: "B1 - Intermediate" },
  { value: "B2", label: "B2 - Upper Intermediate" },
  { value: "C1", label: "C1 - Advanced" },
  { value: "C2", label: "C2 - Proficiency" },
];

export const LessonInputForm = ({ onGenerate, isGenerating }: LessonInputFormProps) => {
  const [topic, setTopic] = useState("");
  const [cefrLevel, setCefrLevel] = useState("B1");
  const [usePreset, setUsePreset] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && cefrLevel) {
      onGenerate(topic, cefrLevel);
    }
  };

  return (
    <Card className="shadow-medium border-border/50 overflow-hidden">
      <CardHeader className="gradient-card border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="w-5 h-5 text-accent" />
          Create Your Lesson
        </CardTitle>
        <CardDescription>Choose a topic and CEFR level to generate your lesson</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Selection Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setUsePreset(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                usePreset 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preset Topics
            </button>
            <button
              type="button"
              onClick={() => setUsePreset(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !usePreset 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom Topic
            </button>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-foreground font-medium">
              Lesson Topic
            </Label>
            {usePreset ? (
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger id="topic" className="bg-background">
                  <SelectValue placeholder="Select a topic..." />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_TOPICS.map((presetTopic) => (
                    <SelectItem key={presetTopic} value={presetTopic}>
                      {presetTopic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="topic"
                placeholder="Enter your custom topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background"
                required
              />
            )}
          </div>

          {/* CEFR Level */}
          <div className="space-y-2">
            <Label htmlFor="cefrLevel" className="text-foreground font-medium">
              CEFR Level
            </Label>
            <Select value={cefrLevel} onValueChange={setCefrLevel}>
              <SelectTrigger id="cefrLevel" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CEFR_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-lg shadow-medium hover:shadow-soft transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Your Lesson...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Lesson
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
