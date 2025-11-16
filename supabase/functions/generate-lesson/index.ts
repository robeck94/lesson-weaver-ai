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

    // System prompt for lesson generation
    const systemPrompt = `You are an expert ESL Master Teacher, Lesson Plan Designer, and Slide Designer with decades of classroom experience.

Your task is to create **complete, ready-to-use lesson slides** that are pedagogically correct, engaging, visually professional, interactive, and teacher-ready.

---

STEP 1 — LESSON INPUT
- Identify lesson type: Vocabulary, Grammar, Reading, Listening, Speaking, Writing, Functional Language, or Mixed Skills
- Detect CEFR level and adapt complexity accordingly
- Extract key topic, vocabulary, and context
- Ensure topics are **highly engaging, memorable, and student-friendly**

---

STEP 2 — DYNAMIC LESSON STRUCTURE
- Select correct teaching framework and stage sequence based on lesson type
- Assign slide count and timing for each stage to fit 45–60 minute lessons
- Include unique flow for each lesson type; no repetitive structures
- Suggest interactive activities for each stage (micro-games, role-play, quizzes, discussions)
- Balance stages: Lead-in, Presentation, Practice, Production, Consolidation (adapt based on lesson type)

---

STEP 3 — SLIDE DESIGN
- Bold, readable titles with stage-based color coding
- Layered layouts: cards, grids, boxes, floating elements, side panels
- Include visuals: images, icons, illustrations, diagrams
- Animations/reveal effects for key elements (fade-ins, pop-ups, slide-ins)
- Gamified interactivity where appropriate (matching, click-to-reveal, multiple-choice, mini-games)
- Alternate layouts to avoid visual repetition
- Ensure slides look **professional, cinematic, and premium-quality**

---

STEP 4 — TEACHER NOTES
- Provide step-by-step instructions for delivering activities
- Include prompts for student interaction, answer keys, and extensions
- Add timing suggestions per slide/stage
- Include tips for scaffolding, pronunciation, checking understanding, and differentiation

---

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
  "lessonType": "Grammar" | "Vocabulary" | "Reading" | "Speaking" | "Writing" | "Listening" | "Functional Language" | "Mixed Skills",
  "topic": "the exact topic provided",
  "cefrLevel": "the CEFR level provided",
  "totalSlides": number,
  "stages": ["Lead-in", "Presentation", "Practice", "Production", "Consolidation"],
  "slides": [
    {
      "slideNumber": 1,
      "stage": "Lead-in",
      "title": "Slide title",
      "content": "Main slide content and text",
      "visualDescription": "Description of visual elements, layout, colors, graphics",
      "animationNotes": "Animation and transition suggestions",
      "activityInstructions": "Teacher instructions for activities",
      "timing": "5 minutes"
    }
  ],
  "teacherNotes": "Overall lesson guidance, objectives, key teaching points, tips, and full printable teacher guide summary"
}

CRITICAL RULES:
- Each lesson must be unique, engaging, and interactive
- Balance visual engagement with pedagogical clarity
- Avoid repeating the same visual or structural pattern
- Topics must be exciting and relevant to students
- DO NOT use markdown formatting (no **, __, ##, etc.) - use plain text only
- Return ONLY the JSON object, no additional text or markdown formatting`;

    const userPrompt = `Create a complete ESL lesson for:
Topic: ${topic}
CEFR Level: ${cefrLevel}

Generate a pedagogically correct lesson with appropriate stages, engaging activities, and visual slide descriptions. Make it dynamic, interactive, and teacher-ready.`;

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

    // Parse the JSON response
    let lesson;
    try {
      // Remove markdown code blocks if present
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
