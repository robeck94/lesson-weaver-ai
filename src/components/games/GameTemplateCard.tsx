import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface GameTemplateCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  playerCount: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  onCustomize: () => void;
}

export const GameTemplateCard = ({
  title,
  description,
  icon: Icon,
  playerCount,
  duration,
  difficulty,
  category,
  onCustomize,
}: GameTemplateCardProps) => {
  const difficultyColors = {
    Easy: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-300",
    Medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-300",
    Hard: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300",
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/40">
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <Badge variant="outline" className={difficultyColors[difficulty]}>
            {difficulty}
          </Badge>
        </div>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            👥 {playerCount}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ⏱️ {duration}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            📂 {category}
          </Badge>
        </div>
        
        <Button 
          onClick={onCustomize}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
        >
          Customize & Generate
        </Button>
      </CardContent>
    </Card>
  );
};
