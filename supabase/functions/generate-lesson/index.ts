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
- **CRITICAL:** Include visuals: images, icons, illustrations, diagrams
  * When slide content references images students need to see (e.g., "Look at the images", "Match the pictures"), the visualDescription MUST specify the exact images to generate
  * For discussion/vocabulary slides about specific items: generate those actual items as images
  * Example: If content says "Look at the smartphone, laptop, tablet" → visualDescription should say "Generate: 1) A modern smartphone showing social media apps, 2) An open laptop, 3) A tablet device, 4) A smartwatch. Arrange in a grid layout"
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
      "content": "THE ACTUAL TEXT, QUESTIONS, AND MATERIAL STUDENTS WILL READ. Examples:\n- For discussion: 'Do you use technology every day? How many apps are on your phone? What are the benefits and drawbacks of technology in your life?'\n- For vocabulary: 'smartphone (noun) - a mobile phone with advanced features\nlaptop (noun) - a portable computer'\n- For grammar: 'Yesterday, I went to the park.\nLast week, she visited her grandmother.\nThey played football on Saturday.'\nNEVER write descriptions like 'A story with blanks' or 'Questions about technology' - write the ACTUAL questions and text",
      "visualDescription": "CRITICAL - This determines what images are generated:\n- If content references images students must see ('Look at the images', 'Match the pictures'), specify EXACTLY what to generate: 'Generate these items in a grid: 1) modern smartphone with Instagram visible, 2) silver laptop, 3) tablet showing Netflix, 4) smartwatch'\n- If content is text-based discussion/grammar, describe supportive styling: 'Colorful background with tech icons, modern clean layout'\n- BE SPECIFIC about what objects/items to generate when students need to see them",
      "animationNotes": "INTERNAL NOTE: Animation instructions for presentation - NOT shown to students",
      "activityInstructions": "Teacher instructions for delivering this slide",
      "timing": "5 minutes"
    }
  ],
  "teacherNotes": "Overall lesson guidance, objectives, key teaching points, tips, and full printable teacher guide summary"
}

CRITICAL: The 'content' field must contain the ACTUAL text, sentences, exercises, stories, dialogues, or material that appears on the slide - NOT a description of what should be there. Generate real, complete, ready-to-use content.

CRITICAL RULES:
- Each lesson must be unique, engaging, and interactive
- The 'content' field MUST contain actual slide content (sentences, exercises, stories, dialogues, vocabulary, grammar rules) that students read - NOT descriptions
- Generate complete, ready-to-use material: write the actual story, the actual sentences with blanks, the actual dialogue, the actual vocabulary list
- For practice slides: include 5-8 complete example sentences or exercises with blanks where appropriate
- For vocabulary slides: include the actual words with definitions and example sentences
- For grammar slides: include the actual rules, structures, and 5-6 complete example sentences
- Balance visual engagement with pedagogical clarity
- Avoid repeating the same visual or structural pattern
- Topics must be exciting and relevant to students
- DO NOT use markdown formatting (no **, __, ##, *, etc.) - use plain text only. For emphasis, use CAPS or line breaks
- Format vocabulary entries as: "Word (part of speech): Definition" followed by "Example: [sentence]" on next line
- Return ONLY the JSON object, no additional text or markdown formatting`;

    const userPrompt = `Create a complete ESL lesson for:
Topic: ${topic}
CEFR Level: ${cefrLevel}

CRITICAL REQUIREMENTS:
1. The "content" field must contain ACTUAL text students will read - write complete questions, sentences, stories, vocabulary lists, NOT descriptions
2. For discussion slides: Write 4-6 actual discussion questions
3. For practice slides: Write 6-8 complete example sentences or exercises
4. For vocabulary slides: Write actual word lists with definitions and example sentences
5. For reading slides: Write the complete story or passage (100-200 words)
6. For grammar slides: Write the rules AND 6-8 example sentences demonstrating the structure

VISUAL DESCRIPTIONS - CRITICAL:
7. When slide content references images students need to see (e.g., "Look at the images", "Identify these devices"), the visualDescription MUST specify EXACTLY what to generate
8. Example BAD: "Bright colorful collage of tech devices" 
   Example GOOD: "Generate these specific items in a grid layout: 1) iPhone 14 showing Instagram app, 2) MacBook Pro laptop, 3) iPad tablet displaying YouTube, 4) Apple Watch, 5) Facebook logo icon, 6) TikTok logo icon, 7) Snapchat logo icon"
9. Be specific: list each item/image students need to see and identify

Generate a pedagogically correct lesson with appropriate stages, engaging activities, and REAL student-facing content with SPECIFIC visual requirements.`;

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
