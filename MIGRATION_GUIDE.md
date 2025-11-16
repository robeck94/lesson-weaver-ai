# ESL Lesson Slide Generator - Complete Migration Guide

## 🎯 Overview
This guide will help you migrate the ESL Lesson Slide Generator to any React/Next.js project.

## 📋 Prerequisites
- React 18+ or Next.js 14+
- Node.js 18+
- Supabase account (or any backend with edge functions)
- AI API access (Lovable AI, OpenAI, or Google Gemini)

---

## 📁 File Structure

```
your-project/
├── src/
│   ├── types/
│   │   └── lesson.ts                   # TypeScript interfaces
│   ├── components/
│   │   ├── ui/                         # Shadcn UI components
│   │   ├── LessonInputForm.tsx         # Main input form
│   │   ├── LessonPreview.tsx           # Slide list view
│   │   ├── PresentationMode.tsx        # Fullscreen presentation
│   │   ├── QuizSlide.tsx               # Interactive quiz
│   │   ├── TeacherGuide.tsx            # Teacher instructions
│   │   └── ImageGenerator.tsx          # Image generation
│   ├── pages/ (or app/)
│   │   └── Index.tsx                   # Main page
│   └── lib/
│       └── supabase.ts                 # Backend client
├── api/ (or supabase/functions/)
│   ├── generate-lesson/
│   │   └── index.ts                    # Lesson generation endpoint
│   └── generate-slide-image/
│       └── index.ts                    # Image generation endpoint
└── .env                                # Environment variables
```

---

## 🔧 Step 1: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js lucide-react

# Shadcn UI (run these commands)
npx shadcn@latest init
npx shadcn@latest add button card input label select separator scroll-area toast
npx shadcn@latest add accordion badge tabs

# If using Next.js
npm install next react react-dom
```

---

## 🌐 Step 2: Environment Variables

Create `.env` or `.env.local`:

```bash
# Using Lovable Cloud
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
LOVABLE_API_KEY=your_lovable_api_key

# OR Using OpenAI
OPENAI_API_KEY=your_openai_key

# OR Using Google Gemini
GOOGLE_AI_API_KEY=your_google_key
```

---

## 📝 Step 3: TypeScript Types

Create `src/types/lesson.ts`:

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

---

## 🚀 Step 4: Backend Setup

### Option A: Supabase Edge Functions

1. Install Supabase CLI:
```bash
npm install -g supabase
supabase init
```

2. Create edge functions:
```bash
supabase functions new generate-lesson
supabase functions new generate-slide-image
```

3. Deploy:
```bash
supabase functions deploy generate-lesson
supabase functions deploy generate-slide-image
```

### Option B: Next.js API Routes

Create `app/api/generate-lesson/route.ts` and `app/api/generate-slide-image/route.ts`

### Option C: Express.js Backend

Create endpoints at `/api/generate-lesson` and `/api/generate-slide-image`

---

## 🎨 Step 5: Frontend Components

See COMPONENTS.md for full component code.

Key components to create:
1. **LessonInputForm** - 90+ categorized topics, CEFR level selection
2. **LessonPreview** - Scrollable slide list with presentation button
3. **PresentationMode** - Fullscreen mode with keyboard navigation
4. **TeacherGuide** - Side panel with pedagogy info
5. **QuizSlide** - Interactive quiz with scoring
6. **ImageGenerator** - Batch image generation with progress

---

## 🧠 Step 6: AI Integration

### The System Prompt (Critical!)

The lesson generator uses a 500+ line pedagogical prompt that includes:

**Key Features:**
- 7 lesson type-specific frameworks (PPP, TTT, Pre-While-Post, etc.)
- CEFR-specific scaffolding (A1-C2)
- Age-appropriate adaptations (Young learners, Teens, Adults)
- Interaction patterns for 70-80% Student Talking Time
- 12 high-STT activity structures

**See**: `LESSON_GENERATION_PROMPT.md` for the full system prompt.

---

## 🖼️ Step 7: Image Generation

Uses Google Gemini `gemini-2.5-flash-image-preview` model.

**Alternative Models:**
- DALL-E 3 (OpenAI): `dall-e-3`
- Stable Diffusion (Stability AI)
- Midjourney (via API)

**Prompt Format:**
```
Educational illustration for ESL lesson slide: [Title]. 
[Visual Description]. 
Style: Clean, colorful, professional, suitable for classroom.
```

---

## 📊 Step 8: Data Flow

```
User Input (Topic, CEFR) 
  ↓
LessonInputForm
  ↓
API: /generate-lesson (AI generates 8-12 slides)
  ↓
LessonPreview + TeacherGuide display
  ↓
[Optional] ImageGenerator
  ↓
API: /generate-slide-image × N slides
  ↓
PresentationMode (Fullscreen with images)
```

---

## 🔒 Security Notes

1. **Never expose API keys** in frontend code
2. **Always use server-side** API calls for AI requests
3. **Rate limiting**: Implement on backend (429 errors)
4. **Input validation**: Sanitize topic inputs
5. **CORS**: Configure properly for your domain

---

## 💰 Cost Estimates

**Lovable AI (Recommended):**
- Lesson generation: ~1 credit (~$0.10)
- Image generation: ~0.5 credits per slide (~$0.05 each)
- Total: ~$0.50 per complete lesson with images

**OpenAI:**
- GPT-4o lesson: ~$0.15
- DALL-E 3 images: ~$0.04 per image
- Total: ~$0.50 per lesson

**Google Gemini:**
- Gemini 2.5 Flash: ~$0.05
- Imagen: ~$0.02 per image
- Total: ~$0.25 per lesson

---

## 🎓 Pedagogical Features

This generator implements:

✅ **7 Teaching Frameworks:**
- PPP (Grammar/Vocabulary)
- TTT (Functional Language)
- Pre-While-Post (Reading/Listening)
- Fluency-Focused (Speaking)
- Process Approach (Writing)

✅ **CEFR Scaffolding:**
- A1-A2: 80% controlled, 20% production
- B1-B2: 50/50 balance
- C1-C2: 20% controlled, 80% fluency

✅ **Student Talking Time:**
- Target: 70-80% STT
- 50% Pair Work priority
- Information gaps, Think-Pair-Share, Role-plays

✅ **Age Adaptations:**
- Young Learners: Games, TPR, 5-10 min activities
- Teenagers: Peer work, relevant topics, tech integration
- Adults: Practical applications, professional contexts

---

## 🐛 Common Issues & Solutions

### 1. Images Not Generating
- Check API key is set on backend
- Verify model supports image generation
- Check rate limits (429 errors)

### 2. Lessons Too Generic
- Customize the system prompt
- Add more specific examples
- Increase temperature (0.8-0.9)

### 3. Poor Slide Quality
- Ensure "content" field contains ACTUAL text (not descriptions)
- Prompt emphasizes: "Write the actual questions, not 'Questions about...'"
- Increase practice stage slides (4-6 slides)

### 4. STT Not Maximized
- Check interaction pattern distribution in teacher guide
- Look for "Pairs" and "Small Groups" labels
- Ensure activity instructions specify pair work setup

---

## 📚 Additional Resources

- Full component code: `COMPONENTS.md`
- Complete system prompt: `LESSON_GENERATION_PROMPT.md`
- Edge function code: `BACKEND_FUNCTIONS.md`
- UI styling guide: `STYLING.md`

---

## 🎬 Quick Start

1. Clone components from `COMPONENTS.md`
2. Set up backend from `BACKEND_FUNCTIONS.md`
3. Add system prompt from `LESSON_GENERATION_PROMPT.md`
4. Configure environment variables
5. Test with: "Present Simple Tense" + "A2"

---

## 📞 Support

For questions about:
- **Pedagogical design**: See system prompt documentation
- **Technical implementation**: Check component files
- **AI integration**: Review backend function examples

---

## 📜 License

This migration guide and all associated code is provided as-is for educational purposes.

---

**Generated:** November 2025
**Version:** 1.0.0
**Compatibility:** React 18+, Next.js 14+, Supabase, Lovable Cloud
