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
