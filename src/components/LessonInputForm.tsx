import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, Coffee, Plane, Briefcase, Smartphone, Heart, Leaf, Film, Users, GraduationCap, Palette, BookText, TrendingUp } from "lucide-react";

interface LessonInputFormProps {
  onGenerate: (topic: string, cefrLevel: string) => void;
  isGenerating: boolean;
}

const CATEGORY_ICONS = {
  "Daily Life & Routines": Coffee,
  "Travel & Transportation": Plane,
  "Work & Professional": Briefcase,
  "Technology & Modern Life": Smartphone,
  "Health & Wellness": Heart,
  "Environment & Nature": Leaf,
  "Entertainment & Arts": Film,
  "Social & Relationships": Users,
  "Education & Learning": GraduationCap,
  "Hobbies & Interests": Palette,
  "Grammar Topics": BookText,
  "Current Issues": TrendingUp,
} as const;

const TOPIC_CATEGORIES = {
  "Daily Life & Routines": [
    "Daily Routines",
    "Morning and Evening Habits",
    "Shopping at the Supermarket",
    "Cooking and Recipes",
    "Food and Restaurants",
    "Ordering Food and Drinks",
    "At the Café",
    "Healthy Eating",
    "House Chores and Cleaning",
    "Time Management",
    "Weekend Activities",
    "Personal Hygiene",
    "Meal Planning",
    "Getting Ready for Work/School",
  ],
  "Travel & Transportation": [
    "Travel and Tourism",
    "At the Airport",
    "Booking Hotels and Accommodations",
    "Public Transportation",
    "Asking for Directions",
    "Cultural Differences While Traveling",
    "Adventure Sports",
    "Packing for a Trip",
    "Travel Insurance",
    "Visiting Tourist Attractions",
    "Budget Travel Tips",
    "Beach Vacations",
    "Mountain Hiking",
    "City Tours",
    "Road Trips",
    "Cruise Ships",
  ],
  "Work & Professional": [
    "Business English - Meetings",
    "Job Interviews",
    "Writing Professional Emails",
    "Giving Presentations",
    "Telephone Conversations",
    "Negotiating and Dealing",
    "Office Small Talk",
    "Remote Work and Digital Nomads",
    "Teamwork and Collaboration",
    "Time Management at Work",
    "Career Development",
    "Workplace Conflicts",
    "Networking Events",
    "Performance Reviews",
    "Project Management",
    "Customer Service",
  ],
  "Technology & Modern Life": [
    "Technology and Social Media",
    "Online Shopping",
    "Digital Privacy and Security",
    "Artificial Intelligence",
    "Smartphones and Apps",
    "Gaming Culture",
    "Cryptocurrency and Digital Money",
    "Virtual Reality",
    "Smart Homes",
    "Cloud Storage",
    "Cyberbullying",
    "Streaming Services",
    "E-commerce",
    "Digital Marketing",
    "Website Design",
  ],
  "Health & Wellness": [
    "Health and Fitness",
    "Mental Health and Wellbeing",
    "At the Doctor's Office",
    "Sports and Exercise",
    "Yoga and Meditation",
    "Sleep and Relaxation",
    "Healthy Lifestyle Choices",
    "Stress Management",
    "Nutrition and Diet",
    "Gym and Workout Routines",
    "Medical Emergencies",
    "Alternative Medicine",
    "Dental Health",
    "Vision Care",
  ],
  "Environment & Nature": [
    "Environmental Issues",
    "Climate Change",
    "Recycling and Sustainability",
    "Wildlife and Animals",
    "Gardening and Plants",
    "Natural Disasters",
    "Renewable Energy",
    "Ocean Conservation",
    "Deforestation",
    "Endangered Species",
    "Green Living",
    "Eco-friendly Products",
    "National Parks",
    "Seasons and Weather",
  ],
  "Entertainment & Arts": [
    "Movies and Cinema",
    "Music and Concerts",
    "Books and Reading",
    "Photography",
    "Museums and Art Galleries",
    "Theater and Performing Arts",
    "Podcasts and Audiobooks",
    "Dance and Ballet",
    "Street Art",
    "Music Festivals",
    "Film Genres",
    "Famous Artists",
    "Creative Writing",
    "Stand-up Comedy",
    "Opera",
  ],
  "Social & Relationships": [
    "Making Friends",
    "Dating and Relationships",
    "Family Gatherings",
    "Celebrations and Parties",
    "Wedding Traditions",
    "Apologizing and Forgiving",
    "Building Trust",
    "Long-distance Relationships",
    "Breaking Up",
    "Peer Pressure",
    "Cultural Etiquette",
    "Communication Skills",
    "Conflict Resolution",
    "Baby Showers",
  ],
  "Education & Learning": [
    "University Life",
    "Online Learning",
    "Study Tips and Techniques",
    "Learning Languages",
    "Public Speaking",
    "Exam Preparation",
    "Note-taking Strategies",
    "Research Skills",
    "Library Resources",
    "Study Abroad",
    "Educational Technology",
    "Scholarships and Grants",
    "Group Study Sessions",
  ],
  "Hobbies & Interests": [
    "Photography",
    "Collecting Things",
    "DIY and Crafts",
    "Volunteering",
    "Fashion and Style",
    "Interior Design",
    "Painting and Drawing",
    "Baking and Pastries",
    "Bird Watching",
    "Astronomy",
    "Origami",
    "Model Building",
    "Knitting and Sewing",
    "Scrapbooking",
    "Magic Tricks",
  ],
  "Grammar Topics": [
    "Present Simple Tense",
    "Past Simple Tense",
    "Present Continuous",
    "Future Forms",
    "Modal Verbs",
    "Conditional Sentences",
    "Passive Voice",
    "Reported Speech",
    "Phrasal Verbs",
    "Idioms and Expressions",
    "Comparatives and Superlatives",
    "Relative Clauses",
    "Gerunds and Infinitives",
    "Articles (a, an, the)",
    "Prepositions",
    "Question Formation",
  ],
  "Current Issues": [
    "Fake News and Media Literacy",
    "Work-Life Balance",
    "Generation Gap",
    "Urban vs Rural Living",
    "Minimalism and Decluttering",
    "Social Media Influence",
    "Mental Health Awareness",
    "Immigration and Refugees",
    "Gender Equality",
    "Affordable Housing",
    "Education Reform",
    "Healthcare Systems",
    "Income Inequality",
    "Freedom of Speech",
  ],
};

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
                <SelectContent className="max-h-[400px]">
                  {Object.entries(TOPIC_CATEGORIES).map(([category, topics], index) => {
                    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
                    return (
                      <div key={category}>
                        {index > 0 && <Separator className="my-2" />}
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-xs font-semibold text-primary px-2 py-2">
                            <IconComponent className="w-4 h-4" />
                            {category}
                          </SelectLabel>
                          {topics.map((presetTopic) => (
                            <SelectItem key={presetTopic} value={presetTopic} className="pl-8">
                              {presetTopic}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </div>
                    );
                  })}
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
