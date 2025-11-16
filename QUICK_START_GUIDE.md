# 🚀 Quick Start Guide - ESL Lesson Generator

## ⚡ 5-Minute Setup

### 1. Clone Core Files (3 mins)

```bash
# Create project structure
mkdir esl-generator
cd esl-generator
npx create-react-app . --template typescript
# OR: npx create-next-app@latest .
```

### 2. Install Dependencies (1 min)

```bash
npm install @supabase/supabase-js lucide-react
npx shadcn@latest init
npx shadcn@latest add button card input label select toast
```

### 3. Set Environment Variables (30 sec)

Create `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### 4. Add Backend Functions (30 sec)

**Option A - Quick Test (No Backend):**
Use mock data to test UI first (see MOCK_DATA.ts below)

**Option B - Full Setup:**
Follow BACKEND_FUNCTIONS.md to deploy edge functions

---

## 📦 Essential Files to Copy

### File 1: `src/types/lesson.ts`
```typescript
export interface LessonSlide {
  slideNumber: number;
  stage: string;
  title: string;
  content: string;
  visualDescription: string;
  timing?: string;
  imageUrl?: string;
  interactionPattern?: string;
}

export interface GeneratedLesson {
  lessonType: string;
  framework?: string;
  topic: string;
  cefrLevel: string;
  slides: LessonSlide[];
  teacherNotes: string;
}
```

### File 2: `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### File 3: `src/components/LessonInputForm.tsx`
See full code in migration docs (290+ lines)

**Key Features:**
- 90+ preset topics organized in 12 categories
- CEFR level selector (A1-C2)
- Custom topic input
- Icons for each category
- Category separators with visual hierarchy

### File 4: `src/pages/Index.tsx` (Main Page)
```typescript
import { useState } from "react";
import { LessonInputForm } from "@/components/LessonInputForm";
import { LessonPreview } from "@/components/LessonPreview";
import { TeacherGuide } from "@/components/TeacherGuide";
import { supabase } from "@/lib/supabase";
import { GeneratedLesson } from "@/types/lesson";

export default function Index() {
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (topic: string, cefrLevel: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { topic, cefrLevel }
      });

      if (error) throw error;
      setLesson(data.lesson);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to generate lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">ESL Lesson Generator</h1>
          <p className="text-muted-foreground">AI-Powered Pedagogically Sound Lessons</p>
        </div>

        {!lesson ? (
          <LessonInputForm onGenerate={handleGenerate} isGenerating={isGenerating} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LessonPreview slides={lesson.slides} />
            </div>
            <div>
              <TeacherGuide 
                slides={lesson.slides} 
                teacherNotes={lesson.teacherNotes}
                lessonType={lesson.lessonType}
                framework={lesson.framework}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 🧪 Testing Without Backend (Mock Data)

Create `src/lib/mockData.ts`:

```typescript
import { GeneratedLesson } from "@/types/lesson";

export const MOCK_LESSON: GeneratedLesson = {
  lessonType: "Grammar",
  framework: "PPP",
  topic: "Present Simple Tense",
  cefrLevel: "A2",
  stages: ["Lead-in", "Presentation", "Practice", "Production", "Consolidation"],
  slides: [
    {
      slideNumber: 1,
      stage: "Lead-in",
      title: "What Do You Do Every Day?",
      content: "Do you brush your teeth in the morning?\nDo you eat breakfast?\nDo you go to work or school?\nDo you watch TV in the evening?",
      visualDescription: "Cartoon illustrations of daily routines",
      timing: "5 minutes",
      interactionPattern: "Whole Class"
    },
    {
      slideNumber: 2,
      stage: "Presentation",
      title: "Present Simple - Form",
      content: "I work\nYou work\nHe/She/It works\nWe work\nThey work\n\nExamples:\nI live in Madrid.\nShe studies English.\nThey play football.",
      visualDescription: "Grammar chart with subject pronouns and verb forms",
      timing: "10 minutes",
      interactionPattern: "Whole Class"
    },
    {
      slideNumber: 3,
      stage: "Practice",
      title: "Complete the Sentences",
      content: "1. My sister _____ (work) in a hospital.\n2. We _____ (eat) dinner at 7pm.\n3. He _____ (watch) TV every night.\n4. They _____ (go) to school by bus.\n5. She _____ (study) English on Mondays.",
      visualDescription: "Worksheet style with blanks to fill",
      timing: "8 minutes",
      interactionPattern: "Individual"
    }
  ],
  teacherNotes: "This lesson introduces the Present Simple tense for A2 learners. Focus on third-person -s and frequency adverbs. Use Think-Pair-Share for maximum STT."
};
```

Then in your component:
```typescript
// Quick test without backend
const handleGenerate = async () => {
  setIsGenerating(true);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Fake delay
  setLesson(MOCK_LESSON);
  setIsGenerating(false);
};
```

---

## 🎨 Styling (Minimal Setup)

### Option 1: Use Tailwind (Recommended)
Already set up with Shadcn UI - no extra work needed!

### Option 2: Add Custom Colors
Edit `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
      }
    }
  }
}
```

---

## 🚀 Deploy Options

### Vercel (Easiest)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### GitHub Pages (Static Only)
```bash
npm run build
# Upload dist/ or build/ folder
```

---

## 📊 Feature Checklist

**MVP (Minimum Viable Product):**
- [x] Topic input form
- [x] AI lesson generation
- [x] Slide preview list
- [x] Teacher guide panel

**Nice to Have:**
- [ ] Image generation
- [ ] Presentation mode (fullscreen)
- [ ] Quiz slides (interactive)
- [ ] PDF export
- [ ] Save/load lessons

**Advanced:**
- [ ] User authentication
- [ ] Lesson library (save to database)
- [ ] Collaborative editing
- [ ] Analytics (track usage)

---

## 💰 Cost Breakdown

**For 100 lessons/month:**

| Provider | Cost | Notes |
|----------|------|-------|
| Lovable AI | $5-10 | Best for this project |
| OpenAI (GPT-4o) | $15-20 | Higher quality |
| Google Gemini | $2-5 | Most affordable |

**Recommendation**: Start with Lovable AI for easiest setup.

---

## 🐛 Common Issues

### 1. "API key not configured"
- Check `.env` file exists
- Restart dev server after adding env vars
- Verify key is correct (no quotes needed)

### 2. "Failed to parse lesson data"
- AI sometimes returns markdown formatted JSON
- Solution is in backend code (strips ```json blocks)

### 3. "CORS error"
- Add corsHeaders to backend responses
- Check OPTIONS request handler exists

### 4. Lessons are too generic
- Increase temperature to 0.9
- Add more examples in system prompt
- Specify "Write ACTUAL questions, not descriptions"

---

## 🎓 Next Steps

1. ✅ **Start with Mock Data** - Test UI without backend
2. ✅ **Add Backend** - Deploy one function at a time
3. ✅ **Test with Real AI** - Generate first lesson
4. ✅ **Add Images** - Optional but makes it look professional
5. ✅ **Deploy** - Share with teachers for feedback

---

## 📚 Full Documentation

- **Complete Migration Guide**: MIGRATION_GUIDE.md
- **Backend Functions**: BACKEND_FUNCTIONS.md
- **All Components**: (Available in original project)
- **System Prompt** (The secret sauce): See original project files

---

## 🆘 Need Help?

**Common Questions:**
- "How do I customize topics?" → Edit `TOPIC_CATEGORIES` object
- "Can I use a different AI?" → Yes! See backend alternatives
- "Do I need Supabase?" → No, any backend works
- "How much does this cost?" → ~$0.50 per complete lesson

---

**Ready to build?** Start with mock data, get the UI working, then add real AI! 🚀

---

**Last Updated**: November 2025
**Compatibility**: React 18+, Next.js 14+, Vue 3+, Svelte 4+
