# Quick Copy Guide - Move Slide Generator to Another Project

## 📋 Checklist

### ✅ Step 1: Copy Edge Functions (Backend)

Copy these 3 folders with their `index.ts` files:
```
supabase/functions/generate-lesson/index.ts         (833 lines - the massive prompt)
supabase/functions/generate-slide-image/index.ts    (125 lines - image generation with retries)
supabase/functions/validate-slide-image/index.ts    (163 lines - AI vision validation)
```

### ✅ Step 2: Update Config File

Add to `supabase/config.toml`:
```toml
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
```

### ✅ Step 3: Copy React Components (Frontend)

```
src/pages/Index.tsx                          (413 lines - main orchestration)
src/components/LessonInputForm.tsx           (283 lines - user input form)
src/components/LessonPreview.tsx             (141 lines - slide display)
src/components/ImageValidationWarning.tsx    (71 lines - warning alerts)
src/components/TeacherGuide.tsx              (needs copying)
src/components/PresentationMode.tsx          (needs copying)
```

### ✅ Step 4: Install Dependencies

Check if these are in `package.json`:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.81.1",
    "lucide-react": "^0.462.0",
    "sonner": "^1.7.4",
    "react-router-dom": "^6.30.1"
  }
}
```

Use `lov-add-dependency` tool if needed.

### ✅ Step 5: Verify Secrets

Lovable Cloud automatically provides:
- ✅ `LOVABLE_API_KEY` (in Supabase)
- ✅ `SUPABASE_URL` (in Supabase)
- ✅ `SUPABASE_ANON_KEY` (in Supabase)
- ✅ `VITE_SUPABASE_URL` (in frontend .env)
- ✅ `VITE_SUPABASE_ANON_KEY` (in frontend .env)

No manual configuration needed!

---

## 🎯 Minimal Working Version

If you want to test quickly without all features:

### Minimal Backend (1 function only)
```
supabase/functions/generate-lesson/index.ts
```

### Minimal Frontend
```typescript
// Simple test component
import { supabase } from "@/integrations/supabase/client";

const SimpleTest = () => {
  const handleTest = async () => {
    const { data, error } = await supabase.functions.invoke('generate-lesson', {
      body: { topic: "Food and Restaurants", cefrLevel: "A2" }
    });
    console.log(data);
  };
  
  return <button onClick={handleTest}>Generate Lesson</button>;
};
```

---

## 🔄 Integration Strategies

### Option A: Separate Page (Recommended)
Keep as standalone feature:
```typescript
// Add route in your router
<Route path="/slide-generator" element={<Index />} />
```

### Option B: Integrate into Existing System
Modify `Index.tsx` to fit your project:
- Remove the standalone page wrapper
- Use your existing auth system
- Connect to your database for saving lessons
- Integrate with your styling system

### Option C: API-Only Mode
Use edge functions only, build custom UI:
```typescript
// Just call the functions
const lesson = await supabase.functions.invoke('generate-lesson', {
  body: { topic, cefrLevel }
});

// Build your own UI to display results
```

---

## 📊 File Size Reference

Total code to copy: ~2,100 lines
- Backend: ~1,100 lines (3 functions)
- Frontend: ~1,000 lines (6 components)

Estimated copy time: 15-30 minutes
Estimated testing time: 10-15 minutes
Total: 25-45 minutes

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't forget config.toml
Edge functions won't work without config entries

### ❌ Don't copy without reading
The system uses specific patterns (progressive updates, retry logic)

### ❌ Don't skip validation function
It's what makes the auto-fix work properly

### ❌ Don't use different model names
The models are specific: `gemini-2.5-flash`, `gemini-2.5-flash-image-preview`

### ❌ Don't remove CORS headers
Frontend won't be able to call functions without them

---

## ✅ Verification Steps

After copying, test in this order:

### 1. Test Lesson Generation
```typescript
const { data } = await supabase.functions.invoke('generate-lesson', {
  body: { topic: "Daily Routines", cefrLevel: "A1" }
});
console.log(data.lesson);
```
Expected: JSON with 10-12 slides

### 2. Test Image Generation
```typescript
const { data } = await supabase.functions.invoke('generate-slide-image', {
  body: {
    slideTitle: "Test",
    visualDescription: "A red apple",
    slideContent: "This is an apple",
    retryAttempt: 0
  }
});
console.log(data.imageUrl); // Should be base64 image
```
Expected: base64 image string

### 3. Test Validation
```typescript
const { data } = await supabase.functions.invoke('validate-slide-image', {
  body: {
    imageUrl: "data:image/png;base64,...",
    slideContent: "Apple",
    visualDescription: "Red apple",
    slideTitle: "Test"
  }
});
console.log(data.validation);
```
Expected: { isValid, confidence, issues, recommendation }

### 4. Test Full Flow
Use the UI to generate a complete lesson with images

---

## 🎨 Customization Quick Wins

### Change Colors
```typescript
// In LessonPreview.tsx, modify STAGE_COLORS
const STAGE_COLORS: Record<string, string> = {
  "Lead-in": "bg-blue-100 text-blue-700",  // Change colors here
  "Presentation": "bg-green-100 text-green-700",
  // ...
};
```

### Adjust Topics
```typescript
// In LessonInputForm.tsx, modify TOPIC_CATEGORIES
const TOPIC_CATEGORIES = {
  "Your Category": [
    "Your Topic 1",
    "Your Topic 2",
  ],
  // ...
};
```

### Change Retry Behavior
```typescript
// In Index.tsx
const MAX_RETRIES = 2;  // Change to 1 or 3
if (confidence < 70) {  // Change threshold to 60 or 80
  slidesToRetry.push(i);
}
```

---

## 🔗 Key Code Snippets

### Calling from anywhere in your app:
```typescript
import { supabase } from "@/integrations/supabase/client";

// Generate lesson
const generateLesson = async (topic: string, level: string) => {
  const { data, error } = await supabase.functions.invoke('generate-lesson', {
    body: { topic, cefrLevel: level }
  });
  return data?.lesson;
};

// Generate image
const generateImage = async (description: string, content: string) => {
  const { data } = await supabase.functions.invoke('generate-slide-image', {
    body: {
      visualDescription: description,
      slideTitle: "Custom",
      slideContent: content,
      retryAttempt: 0
    }
  });
  return data?.imageUrl;
};
```

### Displaying base64 image:
```typescript
<img src={imageUrl} alt="Generated slide" />
// imageUrl is already "data:image/png;base64,..." format
```

---

## 📦 What's NOT Needed

These files are supplementary and can be skipped:
- ❌ `src/components/QuizSlide.tsx` - Separate feature
- ❌ `src/components/ImageGenerator.tsx` - Standalone tool
- ❌ `src/pages/GameTemplates.tsx` - Different feature
- ❌ `src/pages/NotFound.tsx` - Routing only
- ❌ All game-related components

---

## 🎯 Success Criteria

You'll know it works when:
1. ✅ Lesson generates in ~10-15 seconds
2. ✅ Images appear one by one
3. ✅ Validation warnings show for mismatched images
4. ✅ Auto-retry fixes most issues
5. ✅ No console errors

---

## 🆘 Troubleshooting

### "LOVABLE_API_KEY is not configured"
- Check Supabase secrets in Cloud tab
- LOVABLE_API_KEY should exist automatically

### "Function not found"
- Verify `supabase/config.toml` has function entries
- Check function folder structure

### "CORS error"
- Ensure `corsHeaders` in all edge functions
- Check OPTIONS handler exists

### "Rate limit exceeded"
- Add delays between requests
- Upgrade Lovable plan

### Images don't generate
- Check edge function logs in Lovable Cloud
- Verify model name is exactly `google/gemini-2.5-flash-image-preview`

---

## 📞 Need Help?

1. Check edge function logs in Lovable Cloud → Functions tab
2. Use browser console to see frontend errors
3. Test each function individually first
4. Verify all secrets are configured

---

**Estimated Total Time**: 25-45 minutes
**Difficulty**: Intermediate
**Prerequisites**: Lovable Cloud enabled, basic React knowledge
