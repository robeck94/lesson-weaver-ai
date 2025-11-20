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

    // ULTRA-STRICT NO TEXT PROMPT
    let imagePrompt = `🎨 CREATE A PURE VISUAL ILLUSTRATION - ZERO TEXT ALLOWED

⛔ CRITICAL RULES - FOLLOW EXACTLY:
1. NO WORDS - Do not write any words, letters, numbers, or text anywhere in the image
2. NO LABELS - Do not label objects, people, or actions
3. NO CAPTIONS - Do not add explanations or descriptions as text
4. NO SIGNS - Do not include text on signs, books, screens, or objects
5. EMPTY SPEECH BUBBLES ONLY - If showing conversation, use empty speech bubble shapes with no text inside

✅ WHAT TO CREATE:
Pure visual representation: ${visualDescription}

Context (DO NOT WRITE THIS IN THE IMAGE): ${slideTitle}

🎨 STYLE:
- Flat design illustration style
- Bright, engaging colors
- Simple, clean icons and shapes
- Professional educational look
- Think: pure visual icons, not labeled diagrams

EXAMPLES OF CORRECT OUTPUT:
- Alarm clock icon (just the clock, no "6:00 AM" text)
- Person brushing teeth (just the visual action, no "brush teeth" label)
- Coffee cup (just the cup shape, no "coffee" text)
- Empty speech bubbles (bubble shapes only, completely empty inside)

YOU MUST: Create only visual elements. Pretend you cannot write any text at all.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
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
    console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 500));

    // Extract the generated image from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('Full response data:', JSON.stringify(data));
      console.error('Message content:', data.choices?.[0]?.message?.content);
      console.error('Images array:', data.choices?.[0]?.message?.images);
      throw new Error('No image generated in response');
    }

    console.log('Image generated successfully, URL length:', imageUrl.length);

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
