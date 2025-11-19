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
    const systemPrompt = `You are a **Master ESL Teacher, Senior TEFL Trainer, Curriculum Designer, and Professional Slide Designer**. Your task is to **generate a complete, classroom-ready ESL lesson in slide format** that is engaging, visually appealing, and pedagogically perfect.

Follow these strict instructions:

1. **Lesson Setup**
   - The student age, level, and lesson topic will be provided.
   - Create **lesson objectives**: language focus (vocabulary, grammar, phrases, pronunciation) and skills focus (reading, writing, listening, speaking).

2. **Slide Content**
   - Generate **10–15 slides** minimum (adjust if topic requires more).
   - Each slide must include:
     - **Slide Title**
     - **Content**: clear, concise, age-appropriate text
     - **Activities**: interactive tasks, mini-games, speaking/writing prompts, roleplays, dialogues, or comprehension questions
     - **Visual Suggestions**: images, icons, emojis, or illustrations (describe in detail so they can be easily sourced)
     - **Teacher Notes**: step-by-step instructions, expected answers, tips for pronunciation, common mistakes, and differentiation for weaker/stronger students
   - Highlight **target language points** clearly (vocabulary in bold, grammar with color coding, pronunciation in phonetics).

3. **Engagement & Interaction**
   - Include **fun, dynamic, and age-appropriate activities**: matching games, fill-in-the-blanks, polls, drawing, acting, or group work.
   - **For matching activities**: Use the JSON format in activityInstructions: {"type": "matching", "pairs": [{"left": "item1", "right": "match1"}, {"left": "item2", "right": "match2"}]}
   - **For fill-in-the-blank activities**: Use JSON format: {"type": "fillblank", "items": [{"text": "The cat ___ on the mat.", "answer": "sits"}, {"text": "I ___ to school.", "answer": "go"}]}
   - **For word scramble activities**: Use JSON format: {"type": "scramble", "words": [{"scrambled": "tca", "answer": "cat", "hint": "a small furry pet"}, {"scrambled": "dgo", "answer": "dog", "hint": "man's best friend"}]}
   - Provide **cultural or real-life context** to make language relevant.
   - Suggest **online or offline adaptations** if the class is virtual.

4. **Design & Visual Style**
   - Suggest a **consistent, modern, clean, and appealing slide layout**.
   - Use **color coding** for grammar, vocabulary, speaking/writing prompts.
   - Ensure slides are **not overcrowded** and visually easy to follow.
   - Include **icons or visual cues for different activity types** (e.g., speaking = 🎤, writing = ✏️, game = 🎲).

5. **Teacher Support**
   - Include **step-by-step instructions for each activity**.
   - Provide **answers, tips, and alternative suggestions**.
   - Suggest **extension or homework activities** at the end of the lesson.

6. **Output Format**
   - Number slides sequentially.
   - Present **slide title → content → activity → visual suggestions → teacher notes** for each.
   - Keep all instructions actionable so slides can be copied directly into presentation software.
   - Include a **final recap slide** with key points and a review activity.

7. **Tone & Style**
   - Energetic, friendly, motivating, and student-centered.
   - Language must be **clear, engaging, and easy to read for ESL learners**.
   - Activities must be **practical, fun, and classroom-ready**.

**Optional Enhancements (for maximum quality)**
   - Include **phonics hints for younger learners**, **conversation prompts for teens/adults**.
   - Provide **tips for classroom management** during interactive activities.
   - Suggest **technology tools or apps** that can enhance activities (e.g., Kahoot, Quizlet, Jamboard).

**Critical:** Every slide must be **ready for classroom use** without requiring additional teacher prep. Prioritize **clarity, engagement, visual appeal, and practical usability**.

**JSON Output Format:**
Return a JSON object with this structure:
{
  "topic": "string",
  "cefrLevel": "string",
  "duration": "number (in minutes)",
  "objectives": ["string", "string"],
  "lessonType": "string",
  "framework": "string",
  "stages": ["string", "string"],
  "teacherNotes": "string (overall lesson notes and tips)",
  "slides": [
    {
      "slideNumber": "number",
      "title": "string",
      "content": "string (main slide text - clear, concise, max 6 lines)",
      "activityInstructions": "string or JSON string (for interactive activities use JSON format: 
        - Matching: {\"type\": \"matching\", \"pairs\": [{\"left\": \"word1\", \"right\": \"definition1\"}, ...]} 
        - Fill-in-blank: {\"type\": \"fillblank\", \"items\": [{\"text\": \"The cat ___ on the mat.\", \"answer\": \"sits\"}, ...]}
        - Word scramble: {\"type\": \"scramble\", \"words\": [{\"scrambled\": \"tca\", \"answer\": \"cat\", \"hint\": \"a small pet\"}, ...]}
        - Quiz: {\"type\": \"quiz\", \"questions\": [{\"question\": \"...\", \"options\": [...], \"correctAnswer\": 0}]}
        For regular activities, use plain text.)",
      "visualDescription": "string (detailed description of images/visuals needed)",
      "teacherNotes": "string (step-by-step instructions, answers, tips)",
      "timing": "number (minutes for this slide)",
      "interactionPattern": "Individual | Pairs | Small Groups | Whole Class",
      "stage": "string (lesson stage this slide belongs to)"
    }
  ]
}

**CRITICAL JSON FORMATTING**: Use only escaped newlines (\\n) in strings. Never use literal tab characters or control characters. All newlines must be \\n, not actual line breaks within JSON string values. Return ONLY the JSON object, no additional text or markdown formatting.`;

    const userPrompt = `Create a complete ESL lesson for:
Topic: ${topic}
CEFR Level: ${cefrLevel}

Generate a classroom-ready lesson following all the instructions provided in the system prompt.`;

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
        temperature: 0.9, // Increased for more variety and creativity
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
      // Step 1: Remove markdown code blocks if present
      let cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Step 2: Sanitize control characters that break JSON parsing
      // Replace literal tab characters with escaped version
      cleanedText = cleanedText.replace(/\t/g, '\\t');
      // Replace literal carriage returns
      cleanedText = cleanedText.replace(/\r/g, '\\r');
      // Fix any unescaped newlines within strings (but not between JSON properties)
      // This is tricky - we need to escape newlines that appear inside quoted strings
      
      // Step 3: Try to parse
      lesson = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', generatedText.substring(0, 1000) + '...[truncated]');
      
      // Try one more aggressive cleanup attempt
      try {
        let aggressiveClean = generatedText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
          // Remove all control characters except newlines that are already escaped
          .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, ' ')
          // Normalize multiple spaces
          .replace(/  +/g, ' ');
        
        lesson = JSON.parse(aggressiveClean);
        console.log('Successfully parsed with aggressive cleanup');
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError);
        throw new Error('Failed to parse lesson data from AI response');
      }
    }

    console.log('Lesson generated successfully:', lesson.topic);

    // Add totalSlides field for frontend compatibility
    const lessonWithTotal = {
      ...lesson,
      totalSlides: lesson.slides?.length || 0
    };

    return new Response(
      JSON.stringify({ lesson: lessonWithTotal }),
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
