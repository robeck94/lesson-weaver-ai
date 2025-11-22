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
    const { topic, cefrLevel, ageGroup, context, remixInstruction, currentLesson, template } = await req.json();
    console.log('Generating lesson for:', { topic, cefrLevel, ageGroup, context, isRemix: !!remixInstruction, hasTemplate: !!template });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build age/context customizations
    let ageContextGuidance = '';
    
    // Age-specific guidance
    if (ageGroup === 'kids') {
      ageContextGuidance += `\nAGE GROUP: KIDS (6-12 years old)
- Use simple, concrete vocabulary (avoid abstract concepts)
- Short sentences (5-8 words maximum)
- Include games, songs, and movement activities
- Use colorful visuals, cartoon characters, and fun illustrations
- Topics should relate to their world (family, school, toys, animals, food)
- Add TPR (Total Physical Response) activities
- Praise and encouragement throughout
- Include storytelling and picture-based activities
- Use repetition and drilling in a playful way
- Avoid complex grammar explanations, focus on patterns and examples
`;
    } else if (ageGroup === 'teens') {
      ageContextGuidance += `\nAGE GROUP: TEENAGERS (13-17 years old)
- Topics must be relevant to teenage life (social media, school, friendships, music, sports, identity)
- Use modern references, pop culture, memes where appropriate
- Include peer interaction and collaboration (pair/group work essential)
- Encourage self-expression and personal opinions
- Mix structured and creative tasks
- Use authentic materials (YouTube videos, song lyrics, social media posts)
- Avoid being patronizing or overly childish
- Include debates, discussions, and problem-solving
- Use technology and digital tools where possible
- Respect their emerging adult identities
`;
    } else {
      ageContextGuidance += `\nAGE GROUP: ADULTS (18+ years old)
- Professional and real-world contexts (work, travel, relationships, current affairs)
- More complex topics and abstract concepts allowed
- Formal and informal register awareness
- Include authentic materials (news articles, business emails, podcasts)
- Tasks should be practical and immediately applicable
- Respect their life experience and prior knowledge
- Include critical thinking and analysis tasks
- Mix accuracy and fluency activities
- Provide clear rationale for learning objectives
- Allow autonomy and choice in activities
`;
    }
    
    // Context-specific guidance
    if (context === 'academic') {
      ageContextGuidance += `\nLEARNING CONTEXT: ACADEMIC ENGLISH
- Focus on academic vocabulary and formal register
- Include essay writing, note-taking, lecture comprehension skills
- Use academic texts (research articles, textbook excerpts, academic journals)
- Teach citation and referencing skills
- Include critical reading and analysis
- Focus on argumentation and academic discourse
- Prepare for university-level tasks (presentations, seminars, essays)
- Use disciplinary examples (science, humanities, social sciences)
- Teach paraphrasing, summarizing, and synthesizing information
- Include exam strategies for IELTS Academic, TOEFL
`;
    } else if (context === 'business') {
      ageContextGuidance += `\nLEARNING CONTEXT: BUSINESS ENGLISH
- Professional vocabulary and workplace terminology
- Focus on emails, reports, presentations, meetings, negotiations
- Include telephone skills and conference call etiquette
- Use authentic business materials (contracts, proposals, corporate communications)
- Teach formal and diplomatic language
- Include networking and small talk skills
- Focus on clarity, concision, and professionalism
- Use case studies and real business scenarios
- Include cultural awareness for international business
- Prepare for business presentations and pitches
`;
    } else if (context === 'exam') {
      ageContextGuidance += `\nLEARNING CONTEXT: EXAM PREPARATION (IELTS, TOEFL, Cambridge)
- Teach exam strategies and time management
- Include practice with exam task types
- Focus on both accuracy and exam technique
- Use authentic exam materials and formats
- Teach marking criteria and what examiners look for
- Include timed practice and realistic conditions
- Focus on common exam topics and question patterns
- Teach how to structure answers effectively
- Include rubrics and self-assessment
- Provide tips for each exam section (reading, writing, listening, speaking)
- Address common mistakes and how to avoid them
`;
    } else {
      ageContextGuidance += `\nLEARNING CONTEXT: GENERAL ENGLISH
- Balance of all four skills (reading, writing, listening, speaking)
- Everyday situations and practical communication
- Mix of topics from daily life, travel, work, hobbies, relationships
- Include functional language (making requests, giving opinions, describing, narrating)
- Cultural awareness and intercultural communication
- Real-world tasks that learners can use immediately
- Balance accuracy (grammar/vocabulary) and fluency (natural communication)
`;
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

    // System prompt for lesson generation - COMPREHENSIVE PEDAGOGICAL MODE
    const systemPrompt = `You are a Master ESL Teacher, Senior TEFL Trainer, Curriculum Designer, and Professional Slide Designer with 20+ years of experience creating world-class language lessons.
${ageContextGuidance}
${templatePreferences}

═══════════════════════════════════════════════════════════════════
LESSON SETUP & FRAMEWORK
═══════════════════════════════════════════════════════════════════

MANDATORY STRUCTURE - Follow PPP (Presentation-Practice-Production) Framework:

1. WARMER (1 slide, 3-5 min)
   - Hook to capture attention and activate prior knowledge
   - Personal question, visual stimulus, or quick game
   - Connect to target language naturally

2. LEAD-IN (1-2 slides, 5-7 min)
   - Introduce topic context with authentic materials
   - Elicit target language from students before explicit teaching
   - Set clear learning objectives

3. PRESENTATION (2-3 slides, 10-12 min)
   - Explicit teaching of target language (vocabulary, grammar, functions)
   - Clear form, meaning, and pronunciation guidance
   - Visual aids, timelines, concept questions
   - Examples in authentic contexts

4. CONTROLLED PRACTICE (2-3 slides, 10-12 min)
   - Accuracy-focused activities
   - Matching, gap-fills, sentence transformation
   - Immediate feedback and error correction
   - Scaffolded support

5. FREER PRACTICE (2-3 slides, 10-12 min)
   - Fluency-focused tasks with some control
   - Guided dialogues, structured role-plays
   - Information gap activities
   - Monitor and note errors for delayed correction

6. PRODUCTION (1-2 slides, 10-15 min)
   - Authentic, meaningful output task
   - Creative use of target language
   - Real-world scenarios, projects, presentations
   - Student autonomy and creativity

7. CLOSURE (1 slide, 5 min)
   - Review key points
   - Self-assessment or reflection
   - Homework assignment with clear instructions

TOTAL: 10-15 slides, 60-75 minutes

═══════════════════════════════════════════════════════════════════
CEFR LEVEL SPECIFICATIONS (CRITICAL)
═══════════════════════════════════════════════════════════════════

A1 (Beginner):
- Vocabulary: 300-500 high-frequency words, concrete nouns, basic verbs
- Grammar: Present simple, basic questions, imperatives, can/can't
- Topics: Personal info, family, daily routines, food, colors, numbers
- Task Types: Matching pictures-words, simple gap-fills, memorization
- Sentence Length: 3-7 words maximum
- Examples: "I am a teacher." "What is your name?" "I like pizza."

A2 (Elementary):
- Vocabulary: 800-1200 words, adjectives, common phrasal verbs
- Grammar: Past simple, present continuous, going to, comparatives
- Topics: Shopping, travel, hobbies, simple past events
- Task Types: Dialogue completion, simple role-plays, basic writing
- Sentence Length: 5-10 words
- Examples: "I went to the cinema yesterday." "What are you doing?"

B1 (Intermediate):
- Vocabulary: 1500-2000 words, abstract concepts, collocations
- Grammar: Present perfect, conditionals (1st, 2nd), passives, modals
- Topics: Work, education, environment, experiences, opinions
- Task Types: Discussions, debates, extended writing, problem-solving
- Sentence Length: 8-15 words, complex sentences
- Examples: "If I had more time, I would learn to play the guitar."

B2 (Upper-Intermediate):
- Vocabulary: 3000-4000 words, idioms, register awareness
- Grammar: All tenses, mixed conditionals, reported speech, inversion
- Topics: Current affairs, culture, professional contexts, hypotheticals
- Task Types: Presentations, critical analysis, formal writing
- Sentence Length: 10-20 words, subordinate clauses
- Examples: "Having considered all options, I believe we should proceed cautiously."

C1 (Advanced):
- Vocabulary: 5000+ words, nuanced expressions, academic language
- Grammar: All advanced structures, hedging, discourse markers
- Topics: Abstract concepts, specialized fields, academic discourse
- Task Types: Research, essays, formal presentations, negotiations
- Sentence Length: 15-25+ words, complex structures
- Examples: "The extent to which globalization has impacted indigenous cultures remains a contentious issue."

C2 (Proficiency):
- Vocabulary: 8000+ words, subtle distinctions, literary language
- Grammar: Sophisticated structures, stylistic variation
- Topics: Any topic with precision and sophistication
- Task Types: Advanced writing, interpretation, expert discussions

═══════════════════════════════════════════════════════════════════
SLIDE CONTENT REQUIREMENTS (EVERY SLIDE)
═══════════════════════════════════════════════════════════════════

EACH SLIDE MUST INCLUDE:

1. **Title**: Clear, engaging, action-oriented (e.g., "Let's Talk About Your Morning Routine!" not "Morning Routines")

2. **Content**: 
   - Text density: 20-40 words for teaching slides, 50-80 for activity instructions
   - Use bullet points, numbered lists, or short paragraphs
   - Include 2-4 examples per concept
   - Add emojis for visual interest (🎯 📚 💡 ✨ 🎨 🗣️)
   - Use bold for target language
   - Color-code different elements (vocab in blue, grammar in green)

3. **Visual Description**: 
   - Describe EXACTLY what image should show
   - Be specific: "A diverse group of 4 adults (2 men, 2 women, different ethnicities) sitting at a café table, drinking coffee and chatting animatedly. Bright, welcoming atmosphere with morning sunlight."
   - NO TEXT in images - visuals only
   - Images should clarify meaning, not decorate

4. **Activity Instructions** (if applicable):
   - Use JSON format for interactive activities
   - Include clear student task description
   - Specify interaction pattern (pairs/groups)
   - Set time limit
   - Provide example answer

5. **Teacher Notes** (MANDATORY for every slide):
   Format:
   - **Timing**: X minutes
   - **Procedure**: Step-by-step teaching actions
   - **ICQs**: 2-3 Instruction Checking Questions
   - **Anticipated Errors**: Common mistakes + corrections
   - **Extension**: For fast finishers
   
   Example:
   "**Timing**: 8 minutes
   **Procedure**: 1) Display slide, elicit vocabulary. 2) Drill pronunciation chorally and individually. 3) Students match words to pictures in pairs. 4) Check answers as class.
   **ICQs**: Are you working alone or in pairs? (Pairs) How many minutes? (3)
   **Anticipated Errors**: Students may confuse 'borrow' and 'lend'. Clarify: I borrow FROM you, I lend TO you.
   **Extension**: Write 3 sentences using each word."

6. **Timing**: Minutes required (3-5 for warmer, 8-12 for practice activities, etc.)

7. **Interaction Pattern**: Individual / Pairs / Small Groups / Whole Class

8. **Stage**: Warmer / Lead-in / Presentation / Controlled Practice / Freer Practice / Production / Closure

9. **Layout**: Choose based on content type:
   - **text-heavy**: Grammar explanations, complex concepts (minimal image)
   - **image-focused**: Vocabulary, visual concepts (large image, minimal text)
   - **split**: Comparison, dialogue models (50/50 text-image)
   - **example-grid**: Multiple examples, vocabulary sets (3x3 grid)
   - **standard**: Balanced text and image

═══════════════════════════════════════════════════════════════════
ACTIVITY SELECTION LOGIC
═══════════════════════════════════════════════════════════════════

WARMER ACTIVITIES:
- Brainstorming (lists of words/ideas)
- Picture description
- Personal questions
- Prediction tasks
- Quick quizzes

PRESENTATION ACTIVITIES:
- Timelines (for tenses)
- Concept questions
- Form charts (grammar rules)
- Guided discovery (students deduce rules)
- Pronunciation drills

CONTROLLED PRACTICE ACTIVITIES:
- Matching (vocabulary-definitions, questions-answers)
- Fill-in-the-blank (grammar focus)
- Sentence transformation (rewrite using target structure)
- True/False (comprehension check)
- Word scramble (spelling/form)

FREER PRACTICE ACTIVITIES:
- Information gap (find the difference, complete the chart)
- Role-plays (structured scenarios)
- Sentence ordering (paragraph building)
- Dialogue completion (contextualized practice)

PRODUCTION ACTIVITIES:
- Open-ended discussions
- Creative writing tasks
- Presentations/speeches
- Real-world tasks (write email, make reservation)
- Projects

═══════════════════════════════════════════════════════════════════
ENGAGEMENT MANDATES (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════════

EVERY LESSON MUST INCLUDE:

1. **Surprise Element**: Unexpected twist, humorous content, or shocking statistic
2. **Personalization Task**: Students talk about their own lives/experiences
3. **Collaborative Activity**: At least one pair/group task where students help each other
4. **Visual Interest**: Every content slide has an image, emoji, or visual diagram
5. **Movement/Energy**: At least one activity requiring physical movement or high energy
6. **Real-World Connection**: Show how target language is used authentically
7. **Student Choice**: Give options (e.g., "Choose A or B to discuss")

═══════════════════════════════════════════════════════════════════
VISUAL DESIGN STANDARDS
═══════════════════════════════════════════════════════════════════

COLOR PSYCHOLOGY:
- Blue: Trust, learning, clarity → Use for grammar rules
- Green: Growth, nature, practice → Use for practice activities
- Orange: Energy, enthusiasm → Use for warmers/games
- Purple: Creativity, production → Use for output tasks
- Red: Attention, important → Use sparingly for key points

TYPOGRAPHY:
- Titles: Large, bold, 32-40pt
- Body text: 18-24pt, readable at distance
- Examples: Italics or colored text
- Target language: Bold + colored

EMOJI USAGE:
- Activities: 🎯 🎲 🎮 🎨 🎭
- Learning: 📚 📖 📝 ✏️ 📋
- Speaking: 🗣️ 💬 🎤 💭
- Thinking: 💡 🤔 🧠 ⭐
- Success: ✅ ✨ 🌟 🏆 👏
- Time: ⏰ ⏱️ ⏳

LAYOUT PRINCIPLES:
- White space: 30% of slide should be empty
- Visual hierarchy: Most important element largest/top-left
- Alignment: Consistent margins and spacing
- Chunking: Group related information visually

═══════════════════════════════════════════════════════════════════
INTERACTIVE ACTIVITY FORMATS
═══════════════════════════════════════════════════════════════════

Use JSON in activityInstructions field:

1. MATCHING: {"type": "matching", "pairs": [{"left": "apple", "right": "🍎 A red fruit"}, ...]}
   - 6-10 pairs
   - Mix text and emoji
   - Ensure one correct match only

2. FILL-IN-BLANK: {"type": "fillblank", "items": [{"text": "I ___ to school yesterday.", "answer": "went"}, ...]}
   - 5-8 items
   - Target specific grammar/vocabulary
   - Provide context sentence

3. WORD SCRAMBLE: {"type": "scramble", "words": [{"scrambled": "ESUOH", "answer": "HOUSE", "hint": "You live here"}, ...]}
   - 6-10 words
   - Always include hints
   - Target vocabulary

4. SENTENCE ORDERING: {"type": "ordering", "items": [{"sentence": "I went to the store.", "words": ["I", "went", "to", "the", "store"]}, ...]}
   - 4-6 sentences
   - Progress from simple to complex
   - Test word order understanding

5. TRUE/FALSE: {"type": "truefalse", "items": [{"statement": "London is the capital of France.", "answer": false, "explanation": "Paris is the capital of France."}, ...]}
   - 6-8 statements
   - Mix obvious and challenging
   - Always explain why

6. DIALOGUE: {"type": "dialogue", "title": "At the Restaurant", "lines": [{"speaker": "Waiter", "text": "Good evening. Table for two?"}, ...]}
   - 6-10 exchanges
   - Authentic language
   - Clear speaker labels

7. ROLE-PLAY: {"type": "roleplay", "scenarios": [{"title": "Job Interview", "situation": "You are interviewing for a marketing position", "roles": ["Interviewer", "Candidate"], "objective": "Ask and answer at least 5 questions", "turns": ["Introduce yourself", "Ask about experience", ...]}]}
   - Clear scenario setup
   - Defined roles
   - Specific objectives

8. QUIZ: {"type": "quiz", "questions": [{"question": "What is the past tense of 'go'?", "options": ["goed", "went", "gone", "goes"], "correctAnswer": 1}]}
   - 5-8 questions
   - Plausible distractors
   - Mix difficulty levels

═══════════════════════════════════════════════════════════════════
TEACHER NOTES TEMPLATE (USE FOR EVERY SLIDE)
═══════════════════════════════════════════════════════════════════

**Timing**: [X] minutes

**Procedure**:
1. [Detailed step-by-step teaching actions]
2. [What teacher says/does]
3. [What students do]
4. [How to transition to next slide]

**ICQs** (Instruction Checking Questions):
- [Question 1]? ([Expected answer])
- [Question 2]? ([Expected answer])

**Anticipated Errors**:
- Error: [Common mistake students make]
  Correction: [How to correct it]
- Error: [Another common mistake]
  Correction: [How to fix]

**Extension** (for fast finishers):
[Additional challenge task]

**Adaptation** (for struggling students):
[Simplified version or extra support]

═══════════════════════════════════════════════════════════════════
QUALITY STANDARDS CHECKLIST
═══════════════════════════════════════════════════════════════════

Before finalizing, ensure:

✅ CEFR-appropriate vocabulary and grammar
✅ Clear learning objectives stated
✅ PPP structure followed with correct stage labels
✅ 10-15 slides with logical progression
✅ Visual description for every content slide (except pure activities)
✅ At least 3 different activity types
✅ Teacher notes for every slide
✅ Timing adds up to 60-75 minutes
✅ Mix of interaction patterns (not all individual/all pairs)
✅ Target language appears in multiple contexts
✅ Cultural sensitivity (avoid stereotypes, Western-centric content)
✅ Authentic, natural language examples
✅ Clear instructions with examples
✅ Engaging hooks and real-world connections
✅ Appropriate layout choices for content type
✅ Emoji and visual interest on most slides

═══════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════

Return ONLY valid JSON (no markdown, no code blocks):

{
  "topic": "string",
  "cefrLevel": "A1|A2|B1|B2|C1|C2",
  "duration": 60-75,
  "objectives": ["By the end, students will be able to...", "..."],
  "lessonType": "Vocabulary|Grammar|Skills|Functional",
  "framework": "PPP",
  "stages": ["Warmer", "Lead-in", "Presentation", "Controlled Practice", "Freer Practice", "Production", "Closure"],
  "teacherNotes": "Overall lesson guidance, materials needed, setup instructions",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Engaging Title",
      "content": "20-80 words of content",
      "activityInstructions": "JSON string or plain text",
      "visualDescription": "Detailed image description (NO TEXT in image)",
      "teacherNotes": "Full teacher notes following template above",
      "timing": 3-15,
      "interactionPattern": "Individual|Pairs|Small Groups|Whole Class",
      "stage": "Warmer|Lead-in|Presentation|Controlled Practice|Freer Practice|Production|Closure",
      "layout": "text-heavy|image-focused|split|example-grid|standard"
    }
  ]
}

═══════════════════════════════════════════════════════════════════
FINAL INSTRUCTIONS
═══════════════════════════════════════════════════════════════════

You are not just generating content - you are crafting a WORLD-CLASS ESL lesson that:
- Follows proven pedagogical principles
- Engages students emotionally and cognitively
- Provides scaffolded support for learning
- Includes clear teacher guidance
- Uses authentic, natural language
- Looks professionally designed
- Is immediately classroom-ready

Take pride in your work. Every slide should be purposeful, polished, and pedagogically sound.

CREATE THE LESSON NOW.`;

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
Age Group: ${ageGroup}
Learning Context: ${context}

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
        model: 'google/gemini-2.5-flash',
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
