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
    const { topic, cefrLevel, remixInstruction, currentLesson, template } = await req.json();
    console.log('Generating lesson for:', { topic, cefrLevel, isRemix: !!remixInstruction, hasTemplate: !!template });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build template preferences text if a template is provided
    let templatePreferences = '';
    if (template) {
      templatePreferences = `

CUSTOM TEACHING STYLE PREFERENCES:
Teaching Style: ${template.teachingStyle}
Tone: ${template.tone}
${template.emphasisAreas.length > 0 ? `Emphasis Areas: Focus particularly on ${template.emphasisAreas.join(', ')}` : ''}
${template.activityPreferences.length > 0 ? `Preferred Activities: Prioritize these activity types: ${template.activityPreferences.join(', ')}` : ''}
${template.customInstructions ? `Additional Instructions: ${template.customInstructions}` : ''}

Please incorporate these preferences throughout the lesson while maintaining all other requirements.
`;
    }

    // System prompt for lesson generation - CREATIVE MODE
    const systemPrompt = `You are an experienced ESL teacher creating a lesson. You have complete creative freedom to design the lesson however you think works best.
${templatePreferences}

Basic Requirements:
- Create 10-15 slides for the given topic and CEFR level
- Make it engaging and appropriate for ESL learners
- Include a mix of content types: teaching slides, practice activities, interactive elements
- Add visual descriptions for images where helpful
- Provide teacher notes with guidance

Creative Freedom:
- YOU decide the lesson structure, pacing, and flow
- YOU choose which activities work best (matching games, dialogues, role-plays, fill-in-blanks, quizzes, discussions, etc.)
- YOU determine the right balance of teaching vs practice
- YOU pick layouts that suit each slide (text-heavy, image-focused, split, grid, or standard)
- YOU decide how much text, how many examples, what emojis to use
- YOU choose the visual style and tone
- Be creative, innovative, and trust your teaching instincts

Activity Formats Available (use JSON in activityInstructions when relevant):
- Matching: {"type": "matching", "pairs": [{"left": "word", "right": "definition"}, ...]}
- Fill-in-blank: {"type": "fillblank", "items": [{"text": "Sentence with ___", "answer": "word"}, ...]}
- Word scramble: {"type": "scramble", "words": [{"scrambled": "tca", "answer": "cat", "hint": "hint"}, ...]}
- Sentence ordering: {"type": "ordering", "items": [{"sentence": "Full sentence", "words": ["array", "of", "words"]}, ...]}
- True/False: {"type": "truefalse", "items": [{"statement": "...", "answer": true/false, "explanation": "..."}, ...]}
- Dialogue: {"type": "dialogue", "title": "...", "lines": [{"speaker": "...", "text": "..."}]}
- Role-play: {"type": "roleplay", "scenarios": [{"title": "...", "situation": "...", "roles": [...], "objective": "...", "turns": [...]}]}
- Quiz: {"type": "quiz", "questions": [{"question": "...", "options": [...], "correctAnswer": 0}]}

Output Format (JSON only):
{
  "topic": "string",
  "cefrLevel": "string",
  "duration": number,
  "objectives": ["string"],
  "lessonType": "string",
  "framework": "string",
  "stages": ["string"],
  "teacherNotes": "string",
  "slides": [
    {
      "slideNumber": number,
      "title": "string",
      "content": "string",
      "activityInstructions": "string or JSON",
      "visualDescription": "string",
      "teacherNotes": "string",
      "timing": number,
      "interactionPattern": "Individual | Pairs | Small Groups | Whole Class",
      "stage": "string",
      "layout": "text-heavy | image-focused | split | example-grid | standard"
    }
  ]
}

Return ONLY valid JSON, no markdown formatting or code blocks.`;

    // User prompt - different for remix vs new lesson
    let userPrompt: string;
    if (remixInstruction && currentLesson) {
      userPrompt = `REMIX REQUEST - Enhance an existing lesson based on the following instruction:

REMIX INSTRUCTION: ${remixInstruction}

CURRENT LESSON:
${currentLesson}

Your task:
1. Take the existing lesson above and enhance it according to the remix instruction
2. Keep the same topic (${topic}) and CEFR level (${cefrLevel})
3. Maintain the lesson structure but ADD or IMPROVE based on the instruction
4. If adding activities, integrate them naturally into the lesson flow
5. Ensure all new content follows the same quality standards
6. Update timing and slide numbers accordingly
7. Keep what works well, enhance what can be better

Generate the COMPLETE enhanced lesson following all the instructions in the system prompt.`;
    } else {
      userPrompt = `Create a complete ESL lesson for:
Topic: ${topic}
CEFR Level: ${cefrLevel}

Generate a classroom-ready lesson following all the instructions provided in the system prompt.`;
    }

    // Define the lesson schema for structured output via tool calling
    const lessonSchema = {
      type: "object",
      properties: {
        topic: { type: "string" },
        cefrLevel: { type: "string" },
        duration: { type: "number" },
        objectives: { type: "array", items: { type: "string" } },
        lessonType: { type: "string" },
        framework: { type: "string" },
        stages: { type: "array", items: { type: "string" } },
        teacherNotes: { type: "string" },
        slides: {
          type: "array",
          items: {
            type: "object",
            properties: {
              slideNumber: { type: "number" },
              title: { type: "string" },
              content: { type: "string" },
              activityInstructions: { type: "string" },
              visualDescription: { type: "string" },
              teacherNotes: { type: "string" },
              timing: { type: "number" },
              interactionPattern: { type: "string" },
              stage: { type: "string" },
              layout: { 
                type: "string",
                enum: ["text-heavy", "image-focused", "split", "example-grid", "standard"]
              }
            },
            required: ["slideNumber", "title", "content", "stage"]
          }
        }
      },
      required: ["topic", "cefrLevel", "slides"],
      additionalProperties: false
    };

    console.log('Calling Lovable AI with structured output...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_esl_lesson",
              description: "Create a complete ESL lesson plan with slides and activities",
              parameters: lessonSchema
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_esl_lesson" } }
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
    console.log('AI Response received, extracting lesson data...');

    // Extract lesson data from structured output (tool call)
    let lesson;
    
    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall && toolCall.function?.name === "create_esl_lesson") {
        // Parse the structured function arguments
        lesson = JSON.parse(toolCall.function.arguments);
        console.log('Successfully extracted lesson from structured output');
      } else {
        // Fallback: try parsing from content if tool call wasn't used
        const generatedText = data.choices?.[0]?.message?.content;
        
        if (!generatedText) {
          throw new Error('No content or tool call received from AI');
        }
        
        console.log('Tool call not found, attempting fallback parse...');
        
        // Simple cleanup: just remove markdown code blocks
        let cleanedText = generatedText.trim();
        const jsonMatch = cleanedText.match(/```json\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          cleanedText = jsonMatch[1].trim();
        } else {
          const codeMatch = cleanedText.match(/```\s*\n?([\s\S]*?)\n?```/);
          if (codeMatch) {
            cleanedText = codeMatch[1].trim();
          }
        }
        
        lesson = JSON.parse(cleanedText);
        console.log('Successfully parsed from content fallback');
      }
    } catch (parseError) {
      console.error('Failed to extract lesson data:', parseError);
      console.error('Raw AI response:', JSON.stringify(data, null, 2).substring(0, 2000));
      throw new Error('Failed to parse lesson data from AI response');
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
