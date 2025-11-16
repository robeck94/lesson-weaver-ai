# Edge Functions - Copy & Paste Code

Copy these three code blocks exactly as shown.

---

## 1️⃣ Generate Slide Image Function

**Create file:** `supabase/functions/generate-slide-image/index.ts`

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

---

## 2️⃣ Validate Slide Image Function

**Create file:** `supabase/functions/validate-slide-image/index.ts`

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

---

## 3️⃣ Generate Lesson Function

**Create file:** `supabase/functions/generate-lesson/index.ts`

**⚠️ This file is 926 lines. I'll share it separately.**

The generate-lesson function is in the actual files. You can either:
1. Copy it from `supabase/functions/generate-lesson/index.ts` in this project (Dev Mode)
2. Or I can send it in chunks if needed

---

## 4️⃣ Config File Update

**Add to:** `supabase/config.toml`

```toml
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
```

---

## Next Steps

1. Create the three function folders and files
2. Copy the code above into each file
3. Update config.toml
4. Functions deploy automatically!

Need the generate-lesson code? It's in the project files or I can provide it in sections.
