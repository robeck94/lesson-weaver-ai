# ESL Lesson Slide Generator - Teflkit Integration Guide

## 🎯 Overview
This guide will help you integrate the ESL Lesson Slide Generator into your teflkit project. The integration includes AI-powered lesson generation, image generation, presentation mode, and interactive quizzes.

---

## 📋 Prerequisites Checklist

Before starting, ensure teflkit has:
- ✅ React 18+ with TypeScript
- ✅ Tailwind CSS configured
- ✅ React Router DOM for routing
- ✅ Supabase/Lovable Cloud enabled (for backend)
- ✅ shadcn/ui components installed

---

## 📦 Step 1: Install Required Dependencies

### Core Dependencies
Run these commands in teflkit:

```bash
# If not already installed
npm install lucide-react @supabase/supabase-js @tanstack/react-query

# Install shadcn/ui components (if not already present)
npx shadcn@latest add button card input label select separator scroll-area toast
npx shadcn@latest add accordion badge tabs dialog
```

### Verify Existing Components
Check if teflkit already has these shadcn components:
- Button, Card, Input, Label, Select
- Separator, ScrollArea, Toast
- Accordion, Badge, Tabs, Dialog

---

## 📁 Step 2: Files to Copy

### 2.1 Type Definitions
**Create: `src/types/lesson.ts`**

```typescript
export interface LessonSlide {
  slideNumber: number;
  stage: string;
  title: string;
  content: string;
  visualDescription: string;
  animationNotes?: string;
  activityInstructions?: string;
  timing?: string;
  imageUrl?: string;
  interactionPattern?: string;
}

export interface GeneratedLesson {
  lessonType: string;
  framework?: string;
  topic: string;
  cefrLevel: string;
  totalSlides: number;
  stages: string[];
  slides: LessonSlide[];
  teacherNotes: string;
}
```

### 2.2 Core Components
Copy these files from this project to teflkit:

```
src/components/
├── LessonInputForm.tsx      ⟶  src/components/lesson/LessonInputForm.tsx
├── LessonPreview.tsx         ⟶  src/components/lesson/LessonPreview.tsx
├── PresentationMode.tsx      ⟶  src/components/lesson/PresentationMode.tsx
├── TeacherGuide.tsx          ⟶  src/components/lesson/TeacherGuide.tsx
├── QuizSlide.tsx             ⟶  src/components/lesson/QuizSlide.tsx
├── ImageGenerator.tsx        ⟶  src/components/lesson/ImageGenerator.tsx
└── NavLink.tsx               ⟶  src/components/lesson/NavLink.tsx (or use existing)
```

**Note:** If teflkit already has a `NavLink` component, you can skip copying it and update imports in other components.

### 2.3 Backend Functions
Copy these edge functions:

```
supabase/functions/
├── generate-lesson/
│   └── index.ts              ⟶  supabase/functions/generate-lesson/index.ts
└── generate-slide-image/
    └── index.ts              ⟶  supabase/functions/generate-slide-image/index.ts
```

### 2.4 Update Supabase Config
**Add to teflkit's `supabase/config.toml`:**

```toml
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false
```

**Important:** Keep teflkit's existing `project_id` at the top of the file!

---

## 🔧 Step 3: Create the Lesson Generator Page

### 3.1 Create New Page Component
**Create: `src/pages/LessonGenerator.tsx`**

```typescript
import { useState } from "react";
import { LessonInputForm } from "@/components/lesson/LessonInputForm";
import { LessonPreview } from "@/components/lesson/LessonPreview";
import { TeacherGuide } from "@/components/lesson/TeacherGuide";
import { ImageGenerator } from "@/components/lesson/ImageGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, BookOpen, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedLesson } from "@/types/lesson";

export default function LessonGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);

  const handleGenerateLesson = async (topic: string, cefrLevel: string) => {
    setIsGenerating(true);
    
    try {
      console.log("Generating lesson for:", { topic, cefrLevel });
      
      // Step 1: Generate lesson content
      const { data: lessonData, error: lessonError } = await supabase.functions.invoke(
        'generate-lesson',
        { 
          body: { topic, cefrLevel }
        }
      );

      if (lessonError) throw lessonError;
      if (!lessonData?.lesson) throw new Error("No lesson data received");

      console.log("Lesson generated successfully:", lessonData.lesson);
      setGeneratedLesson(lessonData.lesson);
      
      toast.success("Lesson generated successfully!", {
        description: `${lessonData.lesson.totalSlides} slides created for ${topic}`,
      });

    } catch (error) {
      console.error("Error generating lesson:", error);
      toast.error("Failed to generate lesson", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Lesson Slide Generator</h1>
              <p className="text-sm text-muted-foreground">AI-Powered ESL Lesson Planning</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!generatedLesson ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Input Form */}
            <LessonInputForm 
              onGenerate={handleGenerateLesson}
              isGenerating={isGenerating}
            />

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 rounded-lg border bg-card">
                <BookOpen className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Pedagogically Sound</h3>
                <p className="text-sm text-muted-foreground">
                  Based on proven ESL frameworks (PPP, TTT, Task-Based)
                </p>
              </div>
              
              <div className="p-6 rounded-lg border bg-card">
                <Zap className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">CEFR-Aligned</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically scaffolded for A1-C2 levels
                </p>
              </div>
              
              <div className="p-6 rounded-lg border bg-card">
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Ready-to-Use Slides</h3>
                <p className="text-sm text-muted-foreground">
                  Generate images and present in fullscreen
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setGeneratedLesson(null)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              ← Generate New Lesson
            </button>

            {/* Generated Lesson Content */}
            <Tabs defaultValue="slides" className="w-full">
              <TabsList>
                <TabsTrigger value="slides">Slides</TabsTrigger>
                <TabsTrigger value="guide">Teacher Guide</TabsTrigger>
                <TabsTrigger value="images">Generate Images</TabsTrigger>
              </TabsList>

              <TabsContent value="slides" className="mt-6">
                <LessonPreview lesson={generatedLesson} />
              </TabsContent>

              <TabsContent value="guide" className="mt-6">
                <TeacherGuide lesson={generatedLesson} />
              </TabsContent>

              <TabsContent value="images" className="mt-6">
                <ImageGenerator 
                  slides={generatedLesson.slides}
                  onImagesGenerated={(updatedSlides) => {
                    setGeneratedLesson(prev => prev ? { ...prev, slides: updatedSlides } : null);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 🛣️ Step 4: Add Routing

### 4.1 Update App Router
Add the new route to teflkit's routing configuration:

**In `src/App.tsx` (or wherever routes are defined):**

```typescript
import LessonGenerator from "@/pages/LessonGenerator";

// Add to your Routes:
<Route path="/lesson-generator" element={<LessonGenerator />} />
```

### 4.2 Add Navigation Link
Add a link to the lesson generator in teflkit's navigation:

**Example for navbar:**
```typescript
<NavLink to="/lesson-generator">
  <Sparkles className="h-4 w-4" />
  Lesson Generator
</NavLink>
```

**Example for sidebar (if using shadcn sidebar):**
```typescript
{
  title: "Lesson Generator",
  url: "/lesson-generator",
  icon: Sparkles
}
```

---

## 🔐 Step 5: Environment Variables

### 5.1 Verify Supabase Connection
Ensure teflkit's `.env` has:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### 5.2 Verify Lovable AI Key
The `LOVABLE_API_KEY` should already be set in Supabase secrets (auto-configured by Lovable Cloud).

**To verify:**
1. Open teflkit in Lovable
2. Go to Cloud tab → Settings → Secrets
3. Check that `LOVABLE_API_KEY` exists

---

## 🚀 Step 6: Deploy Backend Functions

The edge functions will **automatically deploy** when you make changes in the Lovable editor. No manual deployment needed!

### Verify Deployment
After copying the edge function files:
1. Wait ~30 seconds for auto-deployment
2. Check deployment status in Lovable Cloud → Functions tab
3. Test with a lesson generation

---

## 🎨 Step 7: Styling Adjustments (Optional)

### 7.1 Design System Integration
The components use semantic Tailwind tokens. If teflkit has a custom design system:

1. Update `index.css` color variables if needed
2. Components use these tokens:
   - `background`, `foreground`
   - `primary`, `primary-foreground`
   - `muted`, `muted-foreground`
   - `card`, `card-foreground`
   - `border`, `input`

### 7.2 Layout Adjustments
If teflkit has a persistent header/sidebar:
- Adjust the `LessonGenerator` page layout
- Remove the built-in header if duplicate
- Ensure presentation mode can go fullscreen

---

## ✅ Step 8: Testing Checklist

### Basic Functionality
- [ ] Can navigate to `/lesson-generator` page
- [ ] Topic selection dropdown works
- [ ] Custom topic input works
- [ ] CEFR level selection works
- [ ] "Generate Lesson" button triggers generation
- [ ] Loading state displays during generation

### Lesson Generation
- [ ] Lesson generates successfully (8-12 slides)
- [ ] Slides display in preview
- [ ] Teacher guide shows pedagogy info
- [ ] Can navigate between tabs

### Image Generation
- [ ] Can generate images for slides
- [ ] Progress bar updates correctly
- [ ] Generated images display in slides
- [ ] Can regenerate individual images

### Presentation Mode
- [ ] "Start Presentation" button works
- [ ] Fullscreen mode activates
- [ ] Keyboard navigation (←/→) works
- [ ] Can exit presentation
- [ ] Images display correctly

### Quiz Slides (if applicable)
- [ ] Interactive quiz slides work
- [ ] Can select answers
- [ ] Scoring displays correctly

---

## 🐛 Troubleshooting

### Issue: "Function not found" error
**Solution:** Wait 30-60 seconds after copying edge functions for auto-deployment to complete.

### Issue: "Failed to parse lesson data"
**Solution:** Check edge function logs in Cloud → Functions → generate-lesson → Logs

### Issue: Import errors for components
**Solution:** 
- Verify all shadcn components are installed
- Check import paths match teflkit's structure
- Update `@/` alias if teflkit uses different path

### Issue: Styling looks broken
**Solution:**
- Ensure Tailwind is configured with shadcn presets
- Check `index.css` has CSS variables defined
- Verify `tailwind.config.ts` includes component paths

### Issue: Images not generating
**Solution:**
- Verify `LOVABLE_API_KEY` secret exists in Supabase
- Check edge function logs for errors
- Ensure rate limits aren't exceeded

---

## 💰 Cost Estimates

### Per Lesson Generation
- **Lesson content**: ~1 credit (~$0.10)
- **Image generation** (8-12 slides): ~4-6 credits (~$0.40-$0.60)
- **Total**: ~$0.50-$0.70 per complete lesson

### Monthly Usage (Estimates)
- **Light use** (5 lessons/month): ~$2.50-$3.50
- **Moderate use** (20 lessons/month): ~$10-$14
- **Heavy use** (100 lessons/month): ~$50-$70

**Note:** These are Lovable AI credits. Check your workspace usage in Settings → Usage.

---

## 📚 Feature Overview

### Included Features
✅ **7 ESL Teaching Frameworks**
- PPP (Presentation-Practice-Production)
- TTT (Test-Teach-Test)
- Pre-While-Post Reading/Listening
- Task-Based Learning (TBL)
- Fluency-Focused (Speaking)
- Process Approach (Writing)

✅ **CEFR Scaffolding** (A1-C2)
- Automatic difficulty adjustment
- Age-appropriate content
- Vocabulary chunking
- Practice activity distribution

✅ **Student Talking Time (STT) Optimization**
- Target: 70-80% STT
- Pair work prioritization
- Interactive activity patterns

✅ **90+ Categorized Topics**
- Grammar (20+ topics)
- Vocabulary (15+ topics)
- Functions (15+ topics)
- Skills (10+ topics)
- Business English (10+ topics)
- Exam Preparation (10+ topics)

✅ **AI Image Generation**
- Educational illustrations
- Batch generation
- Individual regeneration
- Progress tracking

✅ **Presentation Mode**
- Fullscreen display
- Keyboard navigation
- Professional styling
- Print-friendly

✅ **Teacher Guide**
- Framework explanation
- Stage-by-stage breakdown
- Interaction pattern distribution
- STT optimization notes

---

## 🎓 Pedagogical Quality

The generator implements:

### Framework Implementation
- Clear stage progression
- Scaffolded practice activities
- Authentic language use
- Controlled → Guided → Free practice

### CEFR Alignment
- **A1-A2**: 80% controlled, 20% production
- **B1-B2**: 50/50 balance
- **C1-C2**: 20% controlled, 80% fluency

### STT Optimization
- Information gap activities
- Think-Pair-Share patterns
- Role-plays and discussions
- Minimal teacher talking

### Vocabulary Chunking
- Max 3-4 items per chunk
- Immediate practice after each chunk
- Spiral review throughout lesson
- Context-rich presentation

---

## 🔄 Future Enhancements

### Planned Features
- [ ] Save lessons to database
- [ ] User authentication
- [ ] Lesson library/favorites
- [ ] PDF export
- [ ] Lesson templates
- [ ] Multi-language support
- [ ] Collaboration features
- [ ] Analytics dashboard

---

## 📞 Support & Resources

### Documentation
- **Migration Guide**: `MIGRATION_GUIDE.md`
- **Quick Start**: `QUICK_START_GUIDE.md`
- **Backend Functions**: `BACKEND_FUNCTIONS.md`

### Getting Help
1. Check edge function logs: Cloud → Functions → Logs
2. Review console errors in browser DevTools
3. Verify all environment variables are set
4. Test with simple topic first ("Present Simple" + "A2")

---

## 📝 Integration Checklist

Use this checklist to track your progress:

### Setup
- [ ] Installed all dependencies
- [ ] Copied type definitions (`lesson.ts`)
- [ ] Copied all 7 component files
- [ ] Copied 2 edge function files
- [ ] Updated `supabase/config.toml`

### Integration
- [ ] Created `LessonGenerator.tsx` page
- [ ] Added route to router
- [ ] Added navigation link
- [ ] Verified environment variables
- [ ] Tested navigation to page

### Testing
- [ ] Generated first lesson successfully
- [ ] Slides display correctly
- [ ] Teacher guide shows
- [ ] Image generation works
- [ ] Presentation mode works

### Polish
- [ ] Adjusted styling to match teflkit
- [ ] Integrated with teflkit navigation
- [ ] Tested on mobile/tablet
- [ ] Verified all interactions work

---

## 🎉 You're Done!

Once all checkboxes are complete, the lesson generator is fully integrated into teflkit!

**Test it out:**
1. Navigate to `/lesson-generator`
2. Select "Present Simple" + "A2"
3. Generate lesson
4. Generate images
5. Try presentation mode

**Pro Tip:** Bookmark your most-used topics and CEFR combinations for faster generation.

---

**Version:** 1.0.0  
**Last Updated:** November 2024  
**Compatibility:** React 18+, Lovable Cloud, Supabase  
**License:** MIT (adapt as needed for teflkit)
