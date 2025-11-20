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

    // Enhanced prompt - NO TEXT IN IMAGES
    let imagePrompt = `Create a text-free educational illustration for an ESL lesson slide.

🚫 ABSOLUTELY NO TEXT IN THE IMAGE - THIS IS CRITICAL
- Do NOT include any words, letters, labels, or captions in the image
- Do NOT add slide titles, vocabulary words, or definitions to the image
- The text content is displayed separately - the image must be purely visual

VISUAL CONCEPT:
${visualDescription}

SLIDE CONTEXT (for understanding only - do NOT render this text):
Title: ${slideTitle}

Style Requirements:
- Clean, modern, flat design illustration
- Colorful and engaging for ESL classroom
- Professional quality
- Focus on visual storytelling through icons, scenes, and illustrations only
- No text, no labels, no captions

Examples of what to create:
- For vocabulary slides: Show the objects/actions visually (e.g., person stretching, coffee cup, alarm clock)
- For grammar slides: Use visual diagrams with arrows, boxes, or flowcharts (no text labels)
- For conversation slides: Show people in conversational poses with speech bubble shapes (empty, no text inside)
- For activities: Illustrative scenes that support the learning concept visually

Remember: The image is a visual aid - all text is handled separately by the UI.`;

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
