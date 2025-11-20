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

    // System prompt for lesson generation
    const systemPrompt = `You are a Master ESL Teacher, Senior TEFL Trainer, Curriculum Designer, and Professional Slide Designer. Your task is to generate a complete, classroom-ready ESL lesson in slide format that is engaging, visually appealing, and pedagogically perfect.
${templatePreferences}
CRITICAL TEXT FORMATTING RULE - READ THIS FIRST:
- NEVER use asterisks ** or any markdown symbols in your output
- NEVER use bold, italic, or any formatting marks in slide titles, content, objectives, or any text
- Use ONLY plain text throughout the entire lesson
- For emphasis: use CAPITAL LETTERS, numbered lists, or bullet points (using - or •)
- This is essential for proper display on slides

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
   - **For sentence ordering activities**: Use JSON format: {"type": "ordering", "items": [{"sentence": "The cat sits on the mat.", "words": ["cat", "The", "sits", "mat.", "the", "on"]}, {"sentence": "I go to school.", "words": ["go", "I", "school.", "to"]}]}
   - **For true/false activities**: Use JSON format: {"type": "truefalse", "items": [{"statement": "Cats can fly.", "answer": false, "explanation": "Cats are mammals and cannot fly."}, {"statement": "Water boils at 100°C.", "answer": true, "explanation": "At sea level, water boils at 100 degrees Celsius."}]}
   - **For dialogue completion activities**: Use JSON format: {"type": "dialogue", "title": "At the Restaurant", "lines": [{"speaker": "Waiter", "text": "Good evening! Welcome to our restaurant."}, {"speaker": "Customer", "isBlank": true, "answer": "Thank you! Do you have a table for two?", "hint": "Ask about seating"}, {"speaker": "Waiter", "text": "Yes, right this way please."}]}
   - **For role-play scenarios**: Use JSON format: {"type": "roleplay", "scenarios": [{"title": "Ordering Food", "situation": "You are at a restaurant", "roles": ["Customer", "Waiter"], "objective": "Order a meal politely", "turns": [{"role": "Customer", "prompt": "Greet the waiter and ask for the menu", "tips": ["Be polite", "Use 'please'"], "sampleResponses": ["Hello! Could I see the menu, please?", "Good evening! May I have a menu?"]}]}]}
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

**IMPORTANT - Text Formatting:** 
   - DO NOT use asterisks (**) or any markdown formatting in the slide content, titles, or objectives
   - Use plain text only - the content will be displayed directly without markdown rendering
   - For emphasis, use capital letters, bullet points, or line breaks instead of asterisks
   - Example: Write "Objectives:" NOT "**Objectives:**"

**CRITICAL JSON OUTPUT INSTRUCTIONS - READ FIRST:**
1. Return ONLY valid JSON - no markdown, no code fences, no text before or after
2. Your entire response must be parseable by JSON.parse() - nothing else
3. DO NOT wrap the JSON in markdown code blocks - just return the raw JSON object starting with {
4. All string values must have properly escaped special characters (use \\n for newlines, \\t for tabs, \\" for quotes)
5. Test your JSON is valid before responding

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
        - Sentence ordering: {\"type\": \"ordering\", \"items\": [{\"sentence\": \"The cat sits on the mat.\", \"words\": [\"cat\", \"The\", \"sits\", \"mat.\", \"the\", \"on\"]}, ...]}
        - True/False: {\"type\": \"truefalse\", \"items\": [{\"statement\": \"Cats can fly.\", \"answer\": false, \"explanation\": \"Cats are mammals and cannot fly.\"}, ...]}
        - Dialogue: {\"type\": \"dialogue\", \"title\": \"At the Restaurant\", \"lines\": [{\"speaker\": \"Waiter\", \"text\": \"Good evening!\"}, {\"speaker\": \"Customer\", \"isBlank\": true, \"answer\": \"Thank you!\", \"hint\": \"Polite response\"}]}
        - Role-play: {\"type\": \"roleplay\", \"scenarios\": [{\"title\": \"Ordering Food\", \"situation\": \"You are at a restaurant\", \"roles\": [\"Customer\", \"Waiter\"], \"objective\": \"Order a meal politely\", \"turns\": [{\"role\": \"Customer\", \"prompt\": \"Greet the waiter\", \"tips\": [\"Be polite\"], \"sampleResponses\": [\"Hello!\"]}]}]}
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
    let aggressiveClean: string = '';
    try {
      // Step 1: Remove markdown code blocks and any surrounding text
      let cleanedText = generatedText;
      
      // Extract JSON from markdown code fence if present
      const jsonMatch = cleanedText.match(/```json\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        cleanedText = jsonMatch[1];
      } else {
        // Try without json tag
        const codeMatch = cleanedText.match(/```\s*\n?([\s\S]*?)\n?```/);
        if (codeMatch) {
          cleanedText = codeMatch[1];
        }
      }
      
      cleanedText = cleanedText.trim();
      
      // Step 2: Fix common JSON issues
      // Replace literal newlines within string values (not between JSON properties)
      // This regex finds strings and replaces actual newlines with \n
      cleanedText = cleanedText.replace(/"([^"]*?)"/gs, (_match: string, content: string) => {
        // Escape any unescaped newlines, tabs, and other control chars within the string
        const escaped = content
          .replace(/\\/g, '\\\\')  // Escape backslashes first
          .replace(/\n/g, '\\n')   // Escape newlines
          .replace(/\r/g, '\\r')   // Escape carriage returns
          .replace(/\t/g, '\\t')   // Escape tabs
          .replace(/"/g, '\\"');   // Escape quotes
        return `"${escaped}"`;
      });
      
      // Step 3: Try to parse
      lesson = JSON.parse(cleanedText);
      console.log('Successfully parsed AI response');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response (first 2000 chars):', generatedText.substring(0, 2000));
      
      // Try one more aggressive cleanup attempt
      try {
        aggressiveClean = generatedText
          .replace(/```json\s*\n?/g, '')
          .replace(/```\s*\n?/g, '')
          .trim()
          // Remove control characters completely
          .replace(/[\x00-\x1F\x7F]/g, '')
          .replace(/\n\s*\n/g, '\n');
        
        lesson = JSON.parse(aggressiveClean);
        console.log('Successfully parsed with aggressive cleanup');
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError);
        console.error('Cleaned text (first 2000 chars):', aggressiveClean?.substring(0, 2000));
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
