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
    let imagePrompt = `Educational illustration for ESL lesson slide: ${slideTitle}. ${visualDescription}. 
    
⚠️ CRITICAL SPELLING REQUIREMENT: All text in the image MUST be spelled correctly. Double-check every word before rendering.

Style: Clean, colorful, professional, suitable for classroom presentation. Flat design, friendly, engaging for students.`;
    
    // If this is a retry with validation issues, enhance the prompt
    if (retryAttempt > 0 && validationIssues && validationIssues.length > 0) {
      imagePrompt = `🔴 CRITICAL - Previous image had SPELLING ERRORS and other issues. You MUST fix them:
${validationIssues.map((issue: string, idx: number) => `${idx + 1}. ${issue}`).join('\n')}

Educational illustration for ESL lesson slide: ${slideTitle}

EXACT CONTENT TO INCLUDE (COPY THESE WORDS EXACTLY):
${slideContent}

VISUAL REQUIREMENTS:
${visualDescription}

⚠️ MANDATORY REQUIREMENTS:
1. SPELL EVERY WORD CORRECTLY - This is an educational ESL lesson, spelling mistakes are unacceptable
2. Copy the EXACT words from the content above - do not paraphrase or use synonyms
3. For matching activities, include BOTH the items AND their matches exactly as listed
4. Double-check ALL text before generating the image
5. If there are multiple items or vocabulary words, include them ALL

Style: Clean, colorful, professional, suitable for classroom presentation. Flat design, friendly, engaging for students.`;
    } else if (slideContent) {
      // Even for first attempt, include content context
      imagePrompt = `Educational illustration for ESL lesson slide: ${slideTitle}

CONTENT TO INCLUDE (use these EXACT words):
${slideContent}

VISUAL REQUIREMENTS:
${visualDescription}

⚠️ CRITICAL REQUIREMENTS:
1. SPELL ALL WORDS CORRECTLY - Double-check spelling before generating
2. Use the EXACT vocabulary and phrases from the content above
3. For educational activities (matching, vocabulary lists, etc.), include ALL items mentioned in the content
4. This is for ESL students - accuracy is essential

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
