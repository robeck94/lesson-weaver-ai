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
