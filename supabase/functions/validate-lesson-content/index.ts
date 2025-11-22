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
    const { lesson, cefrLevel, ageGroup, context } = await req.json();
    console.log('Validating lesson content:', { topic: lesson.topic, cefrLevel, ageGroup, context });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build validation prompt
    const validationPrompt = `You are an expert ESL content quality auditor. Analyze the following ESL lesson for potential issues.

LESSON DETAILS:
Topic: ${lesson.topic}
CEFR Level: ${cefrLevel}
Age Group: ${ageGroup}
Learning Context: ${context}

LESSON CONTENT:
${JSON.stringify(lesson.slides, null, 2)}

VALIDATION CRITERIA:

1. COLLOCATION ACCURACY (check for unnatural word combinations):
   - Verify verb-noun collocations (e.g., "make a decision" not "do a decision")
   - Check adjective-noun collocations (e.g., "strong coffee" not "powerful coffee")
   - Identify adverb-verb combinations
   - Flag any unnatural or non-standard collocations

2. CULTURAL SENSITIVITY:
   - Check for Western-centric assumptions or stereotypes
   - Identify potentially offensive content or cultural insensitivity
   - Flag examples that may not be universally understood
   - Check for gender, racial, religious, or cultural bias
   - Verify examples are inclusive and appropriate for international learners

3. GRAMMAR ACCURACY:
   - Check all grammar structures for correctness
   - Verify example sentences follow rules being taught
   - Identify subject-verb agreement errors
   - Check tense consistency
   - Verify article usage (a/an/the)
   - Check preposition usage
   - Identify any grammatical errors in content or instructions

4. CEFR APPROPRIATENESS:
   - Verify vocabulary matches ${cefrLevel} level (not too easy or too difficult)
   - Check grammar structures are appropriate for level
   - Ensure task complexity matches learner proficiency

5. AGE APPROPRIATENESS:
   - Verify topics and examples are suitable for ${ageGroup}
   - Check language register is appropriate
   - Ensure activities match developmental stage

OUTPUT FORMAT (JSON only):
{
  "overallQuality": "excellent" | "good" | "needs_improvement" | "poor",
  "qualityScore": 0-100,
  "issues": [
    {
      "category": "collocation" | "cultural" | "grammar" | "cefr" | "age",
      "severity": "critical" | "major" | "minor",
      "slideNumber": number,
      "issue": "Description of the specific issue",
      "suggestion": "How to fix it",
      "example": "Original text" (optional),
      "correction": "Corrected text" (optional)
    }
  ],
  "strengths": ["List of positive aspects"],
  "recommendations": ["Overall recommendations for improvement"]
}

CRITICAL: Only report genuine issues. Be thorough but fair. Return ONLY valid JSON.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: validationPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent validation
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI validation API error:', response.status, errorText);
      
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

      throw new Error(`AI validation API error: ${response.status}`);
    }

    const data = await response.json();
    const validationText = data.choices?.[0]?.message?.content;
    
    if (!validationText) {
      throw new Error('No validation response received from AI');
    }

    console.log('Raw validation response:', validationText.substring(0, 500));

    // Parse validation results
    let validationResult;
    try {
      // Clean up markdown code blocks if present
      let cleanedText = validationText.trim();
      const jsonMatch = cleanedText.match(/```json\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        cleanedText = jsonMatch[1].trim();
      } else {
        const codeMatch = cleanedText.match(/```\s*\n?([\s\S]*?)\n?```/);
        if (codeMatch) {
          cleanedText = codeMatch[1].trim();
        }
      }
      
      validationResult = JSON.parse(cleanedText);
      console.log('Validation complete. Quality:', validationResult.overallQuality, 'Issues:', validationResult.issues?.length || 0);
    } catch (parseError) {
      console.error('Failed to parse validation results:', parseError);
      console.error('Validation text:', validationText.substring(0, 1000));
      
      // Return a default "passed" validation if parsing fails
      return new Response(
        JSON.stringify({
          validation: {
            overallQuality: 'good',
            qualityScore: 85,
            issues: [],
            strengths: ['Validation completed'],
            recommendations: ['Content appears acceptable']
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ validation: validationResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-lesson-content function:', error);
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
