import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Plus, 
  Zap, 
  Target, 
  Users, 
  BookOpen,
  Brain,
  Smile
} from "lucide-react";

interface RemixOptionsProps {
  onRemix: (instruction: string) => void;
  isRemixing: boolean;
}

const REMIX_OPTIONS = [
  {
    icon: Plus,
    label: "Add Activity",
    instruction: "Add one more interactive activity slide (matching, fill-in-the-blank, or word scramble) to make the lesson more engaging",
    color: "text-blue-500",
    bgColor: "hover:bg-blue-50 dark:hover:bg-blue-950/20"
  },
  {
    icon: Zap,
    label: "Make More Engaging",
    instruction: "Make the lesson more engaging by adding fun elements, interactive activities, and student-centered tasks",
    color: "text-purple-500",
    bgColor: "hover:bg-purple-50 dark:hover:bg-purple-950/20"
  },
  {
    icon: Target,
    label: "Add More Examples",
    instruction: "Add more practical examples and real-life scenarios to help students understand the concepts better",
    color: "text-green-500",
    bgColor: "hover:bg-green-50 dark:hover:bg-green-950/20"
  },
  {
    icon: Users,
    label: "More Group Work",
    instruction: "Add more pair work and group activities to encourage student interaction and collaboration",
    color: "text-orange-500",
    bgColor: "hover:bg-orange-50 dark:hover:bg-orange-950/20"
  },
  {
    icon: Brain,
    label: "Add Critical Thinking",
    instruction: "Add activities that encourage critical thinking, problem-solving, and deeper analysis",
    color: "text-pink-500",
    bgColor: "hover:bg-pink-50 dark:hover:bg-pink-950/20"
  },
  {
    icon: Smile,
    label: "Make It Fun",
    instruction: "Add games, competitions, or fun challenges to make the lesson more enjoyable for students",
    color: "text-yellow-500",
    bgColor: "hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
  },
  {
    icon: BookOpen,
    label: "Add Reading Practice",
    instruction: "Add a reading comprehension activity with questions to practice reading skills",
    color: "text-indigo-500",
    bgColor: "hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
  },
  {
    icon: Sparkles,
    label: "Enhance Visuals",
    instruction: "Improve the visual descriptions to make slides more visually appealing and memorable",
    color: "text-cyan-500",
    bgColor: "hover:bg-cyan-50 dark:hover:bg-cyan-950/20"
  }
];

export const RemixOptions = ({ onRemix, isRemixing }: RemixOptionsProps) => {
  return (
    <Card className="shadow-medium border-border/50">
      <CardHeader className="gradient-card border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-foreground">Remix Lesson</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            AI-Powered
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Enhance your lesson with AI-powered improvements
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {REMIX_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.label}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-2 ${option.bgColor} transition-all hover:shadow-md`}
                onClick={() => onRemix(option.instruction)}
                disabled={isRemixing}
              >
                <Icon className={`w-6 h-6 ${option.color}`} />
                <span className="text-sm font-medium text-center">
                  {option.label}
                </span>
              </Button>
            );
          })}
        </div>
        {isRemixing && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="font-medium">Remixing your lesson...</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This may take a moment as we regenerate and enhance your lesson
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
