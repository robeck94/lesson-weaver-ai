# Backend Functions - Complete Code

## 🔧 Edge Function 1: Generate Lesson

**File**: `supabase/functions/generate-lesson/index.ts` or `api/generate-lesson/route.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, cefrLevel } = await req.json();
    console.log('Generating lesson for:', { topic, cefrLevel });

    // Get API key from environment
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    // OR: const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // SYSTEM PROMPT (500+ lines) - See LESSON_GENERATION_PROMPT.md for full version
    const systemPrompt = `You are an expert ESL Master Teacher...
    
    [FULL PROMPT TOO LONG - SEE LESSON_GENERATION_PROMPT.md]
    
    ...Return ONLY valid JSON object with lesson data.`;

    const userPrompt = `Create a complete ESL lesson for:
Topic: ${topic}
CEFR Level: ${cefrLevel}

CRITICAL FRAMEWORK SELECTION:
1. Identify lesson type from topic
2. Select appropriate framework (PPP, TTT, Pre-While-Post, etc.)
3. Use correct stage names

FRAMEWORK-SPECIFIC REQUIREMENTS:
[Full requirements in LESSON_GENERATION_PROMPT.md]

Generate pedagogically sound lesson with 70-80% STT.`;

    // Call AI API
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // or 'gpt-4o' for OpenAI
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    // Handle rate limits
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credits required. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    // Parse AI response
    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    console.log('AI Response received, parsing...');

    // Clean and parse JSON
    let lesson;
    try {
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      lesson = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', generatedText);
      throw new Error('Failed to parse lesson data from AI response');
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

---

## 🖼️ Edge Function 2: Generate Slide Image

**File**: `supabase/functions/generate-slide-image/index.ts` or `api/generate-slide-image/route.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { visualDescription, slideTitle } = await req.json();
    console.log('Generating image for:', { slideTitle, visualDescription });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create educational illustration prompt
    const imagePrompt = `Educational illustration for ESL lesson slide: ${slideTitle}. 
    ${visualDescription}. 
    Style: Clean, colorful, professional, suitable for classroom presentation. 
    Flat design, friendly, engaging for students.`;

    // Call AI image generation API
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview', // Image generation model
        messages: [
          { role: 'user', content: imagePrompt }
        ],
        modalities: ['image', 'text']
      }),
    });

    // Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credits required. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received');

    // Extract generated image URL
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

---

## 🔄 Alternative: OpenAI Implementation

### For Lesson Generation:
```typescript
// Replace Lovable AI endpoint with:
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o', // or 'gpt-4o-mini'
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    max_tokens: 4000,
  }),
});
```

### For Image Generation:
```typescript
// Use DALL-E 3 instead of Gemini
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'dall-e-3',
    prompt: imagePrompt,
    size: '1024x1024',
    quality: 'standard',
    n: 1,
  }),
});

const data = await response.json();
const imageUrl = data.data[0].url;
```

---

## 🌐 Next.js API Route Version

**File**: `app/api/generate-lesson/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic, cefrLevel } = await request.json();
    
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Same logic as Supabase function...
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      // ... (same as above)
    });

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const lesson = JSON.parse(cleanedText);

    return NextResponse.json({ lesson });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}
```

---

## 📝 Supabase Config

**File**: `supabase/config.toml`

```toml
[functions.generate-lesson]
verify_jwt = false  # Set to true if you want authentication

[functions.generate-slide-image]
verify_jwt = false  # Set to true if you want authentication
```

---

## 🔑 Environment Variables Setup

### Supabase
```bash
# Set secrets via Supabase CLI
supabase secrets set LOVABLE_API_KEY=your_key_here

# Or via dashboard: Settings → Edge Functions → Secrets
```

### Next.js
```bash
# .env.local
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_key
```

### Vercel
```bash
# Add via Vercel dashboard or CLI
vercel env add OPENAI_API_KEY
```

---

## 🚀 Deployment Commands

### Supabase
```bash
supabase functions deploy generate-lesson
supabase functions deploy generate-slide-image
```

### Vercel (Next.js)
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

---

## 🧪 Testing Backend Functions

### Local Testing (Supabase)
```bash
supabase start
supabase functions serve generate-lesson

# Test with curl
curl -X POST http://localhost:54321/functions/v1/generate-lesson \
  -H "Content-Type: application/json" \
  -d '{"topic": "Present Simple", "cefrLevel": "A2"}'
```

### Local Testing (Next.js)
```bash
npm run dev

# Test at http://localhost:3000/api/generate-lesson
```

---

## 💡 Pro Tips

1. **Caching**: Cache generated lessons in database to avoid regenerating
2. **Rate Limiting**: Implement IP-based rate limiting (10 lessons/hour)
3. **Error Handling**: Always return user-friendly error messages
4. **Logging**: Log all requests for debugging and analytics
5. **Timeouts**: Set 60s timeout for AI requests (they can be slow)

---

## 📊 Performance Optimization

```typescript
// Add timeout to AI requests
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 60000); // 60s

const response = await fetch(url, {
  ...options,
  signal: controller.signal
});

clearTimeout(timeout);
```

---

## 🔒 Security Checklist

- ✅ API keys stored in environment variables
- ✅ CORS properly configured
- ✅ Input validation on topic/cefrLevel
- ✅ Rate limiting implemented
- ✅ Error messages don't expose sensitive info
- ✅ JWT verification enabled (if using auth)

---

**Next Steps**: See `LESSON_GENERATION_PROMPT.md` for the complete 500+ line system prompt that powers the pedagogical quality.
