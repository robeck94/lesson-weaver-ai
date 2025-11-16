import { useState } from "react";
import { Link } from "react-router-dom";
import { GameTemplateCard } from "@/components/games/GameTemplateCard";
import { GameCustomizer } from "@/components/games/GameCustomizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Grid3x3, 
  Dices, 
  CreditCard, 
  Puzzle, 
  Brain,
  Search,
  Sparkles,
  Trophy,
  Users,
  Zap,
  ArrowLeft
} from "lucide-react";

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  type: "bingo" | "board" | "cards" | "matching" | "memory";
  icon: typeof Grid3x3;
  playerCount: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  requiredItems: number;
  minItems?: number;
  maxItems?: number;
}

const GAME_TEMPLATES: GameTemplate[] = [
  // Bingo Games
  {
    id: "classic-bingo",
    name: "Classic Bingo",
    description: "Traditional 5x5 bingo grid. Perfect for vocabulary drilling and listening practice.",
    type: "bingo",
    icon: Grid3x3,
    playerCount: "Whole Class",
    duration: "15-20 mins",
    difficulty: "Easy",
    category: "Bingo",
    requiredItems: 25,
    minItems: 16,
    maxItems: 25,
  },
  {
    id: "picture-bingo",
    name: "Picture Bingo",
    description: "Visual bingo with images instead of words. Great for young learners and visual vocabulary.",
    type: "bingo",
    icon: Grid3x3,
    playerCount: "Whole Class",
    duration: "15-20 mins",
    difficulty: "Easy",
    category: "Bingo",
    requiredItems: 16,
    minItems: 12,
    maxItems: 25,
  },
  {
    id: "sentence-bingo",
    name: "Sentence Bingo",
    description: "Bingo with full sentences. Students listen for complete sentences and mark them.",
    type: "bingo",
    icon: Grid3x3,
    playerCount: "Whole Class",
    duration: "20-25 mins",
    difficulty: "Medium",
    category: "Bingo",
    requiredItems: 16,
    minItems: 12,
    maxItems: 20,
  },
  
  // Board Games
  {
    id: "question-board",
    name: "Question Board Game",
    description: "Roll dice and answer questions to move forward. Mix of grammar, vocabulary, and speaking prompts.",
    type: "board",
    icon: Dices,
    playerCount: "2-4 players",
    duration: "25-30 mins",
    difficulty: "Medium",
    category: "Board Games",
    requiredItems: 30,
    minItems: 20,
    maxItems: 40,
  },
  {
    id: "snakes-ladders",
    name: "Snakes & Ladders ESL",
    description: "Classic snakes and ladders with language tasks on each square. Answer correctly to climb!",
    type: "board",
    icon: Dices,
    playerCount: "2-4 players",
    duration: "20-25 mins",
    difficulty: "Medium",
    category: "Board Games",
    requiredItems: 24,
    minItems: 20,
    maxItems: 30,
  },
  {
    id: "race-game",
    name: "Race to the Finish",
    description: "Fast-paced race game. Answer questions quickly to advance. First to finish wins!",
    type: "board",
    icon: Zap,
    playerCount: "2-6 players",
    duration: "15-20 mins",
    difficulty: "Easy",
    category: "Board Games",
    requiredItems: 20,
    minItems: 15,
    maxItems: 30,
  },
  {
    id: "challenge-board",
    name: "Challenge Board",
    description: "Advanced board game with different challenge types: Speaking, Writing, Grammar, Vocabulary.",
    type: "board",
    icon: Trophy,
    playerCount: "3-6 players",
    duration: "30-40 mins",
    difficulty: "Hard",
    category: "Board Games",
    requiredItems: 40,
    minItems: 30,
    maxItems: 50,
  },

  // Flashcards
  {
    id: "vocab-flashcards",
    name: "Vocabulary Flashcards",
    description: "Classic flashcards with word on front, definition/image on back. Perfect for drilling.",
    type: "cards",
    icon: CreditCard,
    playerCount: "1-30 players",
    duration: "10-15 mins",
    difficulty: "Easy",
    category: "Flashcards",
    requiredItems: 20,
    minItems: 10,
    maxItems: 50,
  },
  {
    id: "conversation-cards",
    name: "Conversation Cards",
    description: "Discussion prompts on cards. Students pick a card and discuss the topic with a partner.",
    type: "cards",
    icon: Users,
    playerCount: "Pairs/Groups",
    duration: "20-30 mins",
    difficulty: "Medium",
    category: "Flashcards",
    requiredItems: 30,
    minItems: 20,
    maxItems: 40,
  },
  {
    id: "question-cards",
    name: "Question Cards",
    description: "Cards with questions for speaking practice. Great for interview activities and pair work.",
    type: "cards",
    icon: CreditCard,
    playerCount: "Pairs",
    duration: "15-20 mins",
    difficulty: "Easy",
    category: "Flashcards",
    requiredItems: 24,
    minItems: 15,
    maxItems: 40,
  },

  // Matching Games
  {
    id: "word-definition",
    name: "Word-Definition Match",
    description: "Match vocabulary words to their definitions. Classic matching game for vocabulary review.",
    type: "matching",
    icon: Puzzle,
    playerCount: "1-4 players",
    duration: "10-15 mins",
    difficulty: "Easy",
    category: "Matching",
    requiredItems: 20,
    minItems: 10,
    maxItems: 30,
  },
  {
    id: "question-answer",
    name: "Question-Answer Match",
    description: "Match questions to appropriate answers. Great for functional language practice.",
    type: "matching",
    icon: Puzzle,
    playerCount: "Pairs",
    duration: "15-20 mins",
    difficulty: "Medium",
    category: "Matching",
    requiredItems: 16,
    minItems: 10,
    maxItems: 24,
  },
  {
    id: "collocations",
    name: "Collocation Matching",
    description: "Match words that go together (adjective + noun, verb + preposition, etc.).",
    type: "matching",
    icon: Puzzle,
    playerCount: "Pairs/Groups",
    duration: "15-20 mins",
    difficulty: "Hard",
    category: "Matching",
    requiredItems: 20,
    minItems: 12,
    maxItems: 30,
  },

  // Memory Games
  {
    id: "vocab-memory",
    name: "Vocabulary Memory",
    description: "Classic memory game with vocabulary words and images. Flip cards to find matching pairs.",
    type: "memory",
    icon: Brain,
    playerCount: "2-4 players",
    duration: "15-20 mins",
    difficulty: "Easy",
    category: "Memory",
    requiredItems: 24,
    minItems: 12,
    maxItems: 30,
  },
  {
    id: "sentence-memory",
    name: "Sentence Halves Memory",
    description: "Match sentence beginnings with endings. Memory game for grammar and sentence structure.",
    type: "memory",
    icon: Brain,
    playerCount: "2-4 players",
    duration: "20-25 mins",
    difficulty: "Medium",
    category: "Memory",
    requiredItems: 16,
    minItems: 10,
    maxItems: 24,
  },
];

export default function GameTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredTemplates = GAME_TEMPLATES.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || template.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(GAME_TEMPLATES.map(t => t.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-heading font-bold">ESL Game Templates</h1>
                <p className="text-sm text-muted-foreground">Ready-made games for your classroom</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Lesson Generator</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search game templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Game Templates Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="bingo">Bingo</TabsTrigger>
            <TabsTrigger value="board">Board Games</TabsTrigger>
            <TabsTrigger value="cards">Flashcards</TabsTrigger>
            <TabsTrigger value="matching">Matching</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <GameTemplateCard
                  key={template.id}
                  title={template.name}
                  description={template.description}
                  icon={template.icon}
                  playerCount={template.playerCount}
                  duration={template.duration}
                  difficulty={template.difficulty}
                  category={template.category}
                  onCustomize={() => setSelectedTemplate(template)}
                />
              ))}
            </div>
          </TabsContent>

          {["bingo", "board", "cards", "matching", "memory"].map((type) => (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates
                  .filter(t => t.type === type)
                  .map((template) => (
                    <GameTemplateCard
                      key={template.id}
                      title={template.name}
                      description={template.description}
                      icon={template.icon}
                      playerCount={template.playerCount}
                      duration={template.duration}
                      difficulty={template.difficulty}
                      category={template.category}
                      onCustomize={() => setSelectedTemplate(template)}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates found matching your filters.</p>
          </div>
        )}
      </main>

      {/* Game Customizer Modal */}
      <GameCustomizer
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
        template={selectedTemplate}
      />
    </div>
  );
}
