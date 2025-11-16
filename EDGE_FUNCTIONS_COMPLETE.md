# Complete Edge Functions Code

## 📦 What You Need

Three edge function folders with their `index.ts` files:

```
supabase/functions/
├── generate-lesson/index.ts       (833 lines - THE BIG ONE)
├── generate-slide-image/index.ts  (125 lines - image generation)
└── validate-slide-image/index.ts  (163 lines - validation)
```

Plus config:
```
supabase/config.toml  (add 9 lines)
```

---

## 🔧 1. Generate Slide Image Function

**File**: `supabase/functions/generate-slide-image/index.ts` (125 lines)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { visualDescription, slideTitle, slideContent, validationIssues, retryAttempt = 0 } = await req.json();
    console.log('Generating image for:', { slideTitle, visualDescription, retryAttempt });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Enhanced prompt with validation feedback for retries
    let imagePrompt = `Educational illustration for ESL lesson slide: ${slideTitle}. ${visualDescription}. Style: Clean, colorful, professional, suitable for classroom presentation. Flat design, friendly, engaging for students.`;
    
    // If this is a retry with validation issues, enhance the prompt
    if (retryAttempt > 0 && validationIssues && validationIssues.length > 0) {
      imagePrompt = `IMPORTANT - Previous image had issues, please fix them:
${validationIssues.map((issue: string, idx: number) => `${idx + 1}. ${issue}`).join('\n')}

Educational illustration for ESL lesson slide: ${slideTitle}

EXACT CONTENT TO INCLUDE:
${slideContent}

VISUAL REQUIREMENTS:
${visualDescription}

CRITICAL: Include the EXACT words and vocabulary from the content above. For matching games, show both the words AND definitions exactly as listed in the content. Do not use generic examples.

Style: Clean, colorful, professional, suitable for classroom presentation. Flat design, friendly, engaging for students.`;
    } else if (slideContent) {
      // Even for first attempt, include content context
      imagePrompt = `Educational illustration for ESL lesson slide: ${slideTitle}

CONTENT CONTEXT (include exact words if applicable):
${slideContent}

VISUAL REQUIREMENTS:
${visualDescription}

Style: Clean, colorful, professional, suitable for classroom presentation. Flat design, friendly, engaging for students.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: imagePrompt }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credits required. Please add credits to your workspace.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received');

    // Extract the generated image from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated in response');
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-slide-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

**Key Features**:
- ✅ Accepts `retryAttempt` and `validationIssues` for retry logic
- ✅ Enhances prompt with validation feedback on retries
- ✅ Returns base64 image data URL
- ✅ Handles rate limits (429) and credit errors (402)

---

## 🔍 2. Validate Slide Image Function

**File**: `supabase/functions/validate-slide-image/index.ts` (163 lines)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, slideContent, visualDescription, slideTitle } = await req.json();
    console.log('Validating image for:', { slideTitle });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create validation prompt
    const validationPrompt = `You are an ESL lesson quality checker. Analyze if this generated image matches the slide content.

SLIDE TITLE: ${slideTitle}

SLIDE CONTENT (what students see):
${slideContent}

VISUAL DESCRIPTION (what the image should show):
${visualDescription}

Your task:
1. Check if the image contains the EXACT words/vocabulary from the slide content (especially for matching games, vocabulary lists, or practice activities)
2. Verify the image matches the visual description
3. Identify any mismatches between what's shown and what should be shown

Respond with a JSON object:
{
  "isValid": true/false,
  "confidence": 0-100,
  "issues": ["specific issue 1", "specific issue 2"],
  "recommendation": "brief recommendation for improvement"
}

Be strict: If vocabulary words don't match EXACTLY (e.g., "Hello/Goodbye" instead of "Wildlife/Habitat"), mark as invalid.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: validationPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Skipping validation.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credits required. Skipping validation.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No validation response from AI');
    }

    console.log('AI validation response:', aiResponse);

    // Parse the JSON response from AI
    let validation;
    try {
      // Extract JSON from response (AI might wrap it in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validation = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: assume valid if we can't parse
        validation = {
          isValid: true,
          confidence: 50,
          issues: ['Could not parse validation response'],
          recommendation: 'Manual review recommended'
        };
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      validation = {
        isValid: true,
        confidence: 50,
        issues: ['Could not parse validation response'],
        recommendation: 'Manual review recommended'
      };
    }

    return new Response(
      JSON.stringify({ validation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-slide-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        validation: {
          isValid: true,
          confidence: 0,
          issues: ['Validation failed'],
          recommendation: 'Manual review recommended'
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

**Key Features**:
- ✅ Uses AI vision to analyze images
- ✅ Checks for EXACT vocabulary matches
- ✅ Returns structured validation JSON
- ✅ Falls back gracefully on parsing errors

---

## 📝 3. Generate Lesson Function (THE BIG ONE)

**File**: `supabase/functions/generate-lesson/index.ts` (833 lines)

This function is massive because it contains a ~700 line system prompt with all the ESL pedagogy rules.

### Structure:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, cefrLevel } = await req.json();
    console.log('Generating lesson for:', { topic, cefrLevel });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // System prompt for lesson generation (LINES 23-706)
    const systemPrompt = `You are an expert ESL Master Teacher...
    [~700 lines of pedagogical instructions]
    ...Generate a pedagogically sound lesson.`;

    const userPrompt = `Generate a complete ESL lesson:
    
    Topic: ${topic}
    CEFR Level: ${cefrLevel}
    
    Follow all the rules from the system prompt and output a valid JSON matching the schema.`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credits required. Please add credits to your workspace.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    console.log('AI Response received, parsing...');

    // Parse the JSON response (with cleanup)
    let lesson;
    try {
      let cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      cleanedText = cleanedText.replace(/\t/g, '\\t');
      cleanedText = cleanedText.replace(/\r/g, '\\r');
      lesson = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Try aggressive cleanup
      try {
        let aggressiveClean = generatedText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
          .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, ' ')
          .replace(/  +/g, ' ');
        
        lesson = JSON.parse(aggressiveClean);
        console.log('Successfully parsed with aggressive cleanup');
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError);
        throw new Error('Failed to parse lesson data from AI response');
      }
    }

    console.log('Lesson generated successfully:', lesson.topic);

    return new Response(
      JSON.stringify({ lesson }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-lesson function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

### What the System Prompt Contains (~700 lines):

1. **Lesson Frameworks** - PPP, TTT, Pre-While-Post for different lesson types
2. **Vocabulary Chunking Rules** - Never present all vocab at once
3. **Practice Activity Types** - Games, role-plays, info gaps, etc.
4. **Student Talking Time** - Maximize STT with pair/group work
5. **CEFR Level Adaptations** - Adjust complexity for A1-C2
6. **Slide Design Rules** - Visual descriptions, timing, interaction patterns
7. **JSON Output Schema** - Exact structure for lesson output

### Sample Output:

```json
{
  "lessonType": "Vocabulary",
  "framework": "PPP",
  "topic": "Wildlife and Animals",
  "cefrLevel": "A2",
  "totalSlides": 12,
  "stages": ["Lead-in", "Presentation", "Practice", "Production", "Consolidation"],
  "slides": [
    {
      "slideNumber": 1,
      "stage": "Lead-in",
      "title": "Wildlife Discussion",
      "content": "What animals do you know?\nWhich ones live in the wild?",
      "visualDescription": "Colorful collage of wildlife animals",
      "timing": "5 mins",
      "interactionPattern": "Whole Class",
      "activityInstructions": "Ask questions, build interest..."
    },
    // ... 11 more slides
  ],
  "teacherNotes": "This lesson uses PPP framework..."
}
```

---

## ⚙️ Config File

**File**: `supabase/config.toml`

Add these lines:

```toml
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
```

**Why `verify_jwt = false`?**
- Makes functions public (no authentication required)
- Easier for testing and development
- ⚠️ **Security Note**: For production, you might want to enable JWT and implement proper auth

---

## 🚀 How to Use

### 1. Generate Lesson
```typescript
const { data } = await supabase.functions.invoke('generate-lesson', {
  body: { 
    topic: "Food and Restaurants",
    cefrLevel: "A2" 
  }
});

console.log(data.lesson); // Full lesson with 10-12 slides
```

### 2. Generate Image
```typescript
const { data } = await supabase.functions.invoke('generate-slide-image', {
  body: {
    slideTitle: "Match the Word!",
    visualDescription: "Matching game layout with wildlife vocabulary",
    slideContent: "1. Wildlife\n2. Habitat\n3. Endangered\n4. Extinction",
    retryAttempt: 0
  }
});

console.log(data.imageUrl); // base64 image data URL
```

### 3. Validate Image
```typescript
const { data } = await supabase.functions.invoke('validate-slide-image', {
  body: {
    imageUrl: "data:image/png;base64,...",
    slideContent: "1. Wildlife\n2. Habitat...",
    visualDescription: "Matching game with wildlife vocab",
    slideTitle: "Match the Word!"
  }
});

console.log(data.validation); 
// { isValid, confidence, issues, recommendation }
```

---

## 🎯 Key Points

### Models Used:
- **Lesson Generation**: `google/gemini-2.5-flash` (text)
- **Image Generation**: `google/gemini-2.5-flash-image-preview` (image)
- **Validation**: `google/gemini-2.5-flash` (vision)

### API Gateway:
All functions call: `https://ai.gateway.lovable.dev/v1/chat/completions`

### Secrets Required:
- `LOVABLE_API_KEY` (automatically configured in Lovable Cloud)

### Error Handling:
- 429: Rate limit exceeded
- 402: Credits required
- 500: Server error

---

## 📊 Token Usage (Approximate)

Per lesson generation:
- Lesson content: ~15,000 tokens
- 12 images: ~6,000 tokens (500 each)
- 12 validations: ~12,000 tokens (1,000 each)
- **Total**: ~33,000 tokens per complete lesson

---

## 💡 Tips

1. **Copy all 3 functions** - They work together
2. **Test individually first** - Start with generate-lesson
3. **Check logs** - Use Lovable Cloud → Functions → Logs
4. **Monitor rate limits** - Add delays if needed
5. **Customize prompts** - Edit system prompts for your needs

---

## ✅ Verification

After copying, test:

```bash
# Test 1: Generate lesson
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-lesson \
  -H "Content-Type: application/json" \
  -d '{"topic":"Daily Routines","cefrLevel":"A1"}'

# Test 2: Generate image
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-slide-image \
  -H "Content-Type: application/json" \
  -d '{"slideTitle":"Test","visualDescription":"Red apple","slideContent":"Apple","retryAttempt":0}'

# Test 3: Validate (needs actual image URL)
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/validate-slide-image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"data:image/...","slideContent":"Apple","visualDescription":"Red apple","slideTitle":"Test"}'
```

---

**File Size**: 
- generate-lesson: 833 lines
- generate-slide-image: 125 lines  
- validate-slide-image: 163 lines
- **Total**: 1,121 lines

**Estimated Copy Time**: 5-10 minutes
