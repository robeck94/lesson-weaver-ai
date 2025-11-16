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

STEP 2 — PEDAGOGICALLY BALANCED LESSON STRUCTURE

### PPP STAGE ALLOCATION (for 45-60 minute lessons):
- **Lead-in**: 5-10% (3-5 minutes) - Activate schema, generate interest, assess prior knowledge
- **Presentation**: 20-25% (10-15 minutes) - Introduce new language clearly with examples
- **Practice**: 40-50% (20-30 minutes) - LONGEST STAGE - controlled then freer practice activities
- **Production**: 25-30% (12-18 minutes) - Authentic communication using new language
- **Consolidation**: 5-10% (3-5 minutes) - Review, reflect, assign homework

### CEFR-SPECIFIC SCAFFOLDING:
**A1-A2 (Beginner-Elementary):**
- Heavy scaffolding: 80% controlled practice, 20% semi-controlled production
- Simple sentence structures, high-frequency vocabulary
- Visual support on every slide, frequent repetition
- Short activities (5-7 minutes max), clear step-by-step instructions
- Practice: Drilling, repetition, substitution exercises, matching activities
- Production: Guided dialogues with sentence frames provided

**B1-B2 (Intermediate-Upper Intermediate):**
- Balanced scaffolding: 50% controlled practice, 50% freer practice/production
- Complex sentence structures, collocations, phrasal verbs
- Gradually remove support from Practice to Production stages
- Medium-length activities (7-12 minutes), options for differentiation
- Practice: Gap-fills, error correction, sentence transformation
- Production: Role-plays with prompts, information gap activities, discussions with guiding questions

**C1-C2 (Advanced-Proficiency):**
- Light scaffolding: 20% controlled practice, 80% fluency-focused production
- Nuanced language, idiomatic expressions, register awareness
- Minimal support, focus on accuracy in complex communication
- Longer activities (12-20 minutes), independent work encouraged
- Practice: Text reconstruction, advanced grammar analysis, style comparison
- Production: Debates, presentations, creative writing, authentic task simulations

### AGE-APPROPRIATE ADAPTATIONS:
**Young Learners (6-12 years):**
- Short attention span: Activities max 5-10 minutes, frequent changes
- TPR (Total Physical Response): "Simon Says", action songs, movement-based learning
- Games and competitions: Board races, memory games, treasure hunts
- Visual-heavy slides with cartoon characters, bright colors, large fonts
- Simple clear instructions, repetitive language patterns
- Rewards and positive reinforcement: stickers, stars, praise

**Teenagers (13-17 years):**
- Peer interaction: Pair/group work, discussions, collaborative tasks
- Relevant topics: Social media, music, sports, technology, relationships
- Competition and challenges: Quizzes, debates, team challenges
- Technology integration: QR codes, app references, digital content
- Cool contemporary visuals, modern aesthetic design
- Independence: Self-correction opportunities, learner autonomy

**Adults (18+):**
- Practical applications: Work scenarios, travel, real-life communication
- Respect learner experience: Build on prior knowledge
- Professional topics: Business English, formal correspondence
- Analytical activities: Grammar discovery, error analysis, critical thinking
- Clean professional design, sophisticated visuals
- Time-efficient, goal-oriented, immediate applicability

### INTERACTION PATTERNS FOR MAXIMUM STT (Student Talking Time):
- Aim for 70-80% Student Talking Time vs 20-30% Teacher Talking Time
- Progression: Individual → Pair → Group → Whole Class
- Practice Stage: Start with individual work, move to pairs, then small groups
- Production Stage: Maximize pair/group work, minimize teacher-fronted activities
- Include "Think-Pair-Share" activities to engage all learners
- Specify when activities are: Solo / Pairs / Small Groups (3-4) / Whole Class

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
      "timing": "5 minutes",
      "interactionPattern": "Whole Class" | "Pairs" | "Small Groups" | "Individual",
      "content": "THE ACTUAL TEXT, QUESTIONS, AND MATERIAL STUDENTS WILL READ. Examples:\n- For discussion: 'Do you use technology every day? How many apps are on your phone? What are the benefits and drawbacks of technology in your life?'\n- For vocabulary: 'smartphone (noun) - a mobile phone with advanced features\nlaptop (noun) - a portable computer'\n- For grammar: 'Yesterday, I went to the park.\nLast week, she visited her grandmother.\nThey played football on Saturday.'\nNEVER write descriptions like 'A story with blanks' or 'Questions about technology' - write the ACTUAL questions and text",
      "visualDescription": "CRITICAL - This determines what images are generated:\n- If content references images students must see ('Look at the images', 'Match the pictures'), specify EXACTLY what to generate: 'Generate these items in a grid: 1) modern smartphone with Instagram visible, 2) silver laptop, 3) tablet showing Netflix, 4) smartwatch'\n- If content is text-based discussion/grammar, describe supportive styling: 'Colorful background with tech icons, modern clean layout'\n- BE SPECIFIC about what objects/items to generate when students need to see them\n- AGE-APPROPRIATE: For young learners use cartoon style, for teens use modern/cool style, for adults use professional/realistic style",
      "animationNotes": "INTERNAL NOTE: Animation instructions for presentation - NOT shown to students",
      "activityInstructions": "Teacher instructions for delivering this slide. Include: 1) Interaction pattern (Solo/Pairs/Groups/Whole Class), 2) Step-by-step delivery, 3) Time management tips, 4) Scaffolding suggestions for different CEFR levels, 5) Expected Student Talking Time %"
    }
  ],
  "teacherNotes": "Overall lesson guidance including: 1) Lesson objectives (SMART goals), 2) Key teaching points and anticipated difficulties, 3) Differentiation strategies for mixed-ability classes, 4) Extension activities for fast finishers, 5) Assessment opportunities, 6) Tips for maximizing Student Talking Time, 7) Homework suggestions, 8) Materials needed, 9) Board plan suggestions, 10) Reflection questions for next lesson"
}

CRITICAL PEDAGOGICAL RULES:
- **Practice must be the LONGEST stage** (40-50% of lesson time) - This is where learning happens!
- Lead-in should be SHORT and engaging (5-10% max) - Don't over-teach in the warm-up
- Production should allow authentic communication - Reduce teacher control, increase student autonomy
- Match scaffolding to CEFR level: A1-A2 needs heavy support, C1-C2 needs minimal support
- Include clear interaction patterns: Individual → Pairs → Groups progression
- Specify Student Talking Time expectations for each activity
- Age-appropriate content: Young learners (games/TPR), Teens (relevant/cool), Adults (practical/professional)

CONTENT GENERATION RULES:
- Each lesson must be unique, engaging, and interactive
- The 'content' field MUST contain actual slide content (sentences, exercises, stories, dialogues, vocabulary, grammar rules) that students read - NOT descriptions
- Generate complete, ready-to-use material: write the actual story, the actual sentences with blanks, the actual dialogue, the actual vocabulary list
- For practice slides: include 6-10 complete example sentences or exercises with blanks where appropriate
- For vocabulary slides: include the actual words with definitions and example sentences
- For grammar slides: include the actual rules, structures, and 6-8 complete example sentences
- Balance visual engagement with pedagogical clarity
- Avoid repeating the same visual or structural pattern
- Topics must be exciting and relevant to students
- DO NOT use markdown formatting (no **, __, ##, *, etc.) - use plain text only. For emphasis, use CAPS or line breaks
- Format vocabulary entries as: "Word (part of speech): Definition" followed by "Example: [sentence]" on next line
- Return ONLY the JSON object, no additional text or markdown formatting`;

    const userPrompt = `Create a complete ESL lesson for:
Topic: ${topic}
CEFR Level: ${cefrLevel}

CRITICAL PEDAGOGICAL REQUIREMENTS:

### PPP BALANCE (45-60 minute lesson):
1. Lead-in: 3-5 minutes (1-2 slides) - Quick, engaging warm-up
2. Presentation: 10-15 minutes (2-3 slides) - Clear language introduction with examples
3. Practice: 20-30 minutes (4-6 slides) - LONGEST STAGE - Mix of controlled and freer practice
4. Production: 12-18 minutes (2-3 slides) - Authentic communication tasks
5. Consolidation: 3-5 minutes (1 slide) - Quick review and homework

### CONTENT REQUIREMENTS:
6. The "content" field must contain ACTUAL text students will read - write complete questions, sentences, stories, vocabulary lists, NOT descriptions
7. For discussion slides: Write 4-6 actual discussion questions
8. For practice slides: Write 8-10 complete example sentences or exercises  
9. For vocabulary slides: Write actual word lists with definitions and example sentences
10. For reading slides: Write the complete story or passage (150-250 words for ${cefrLevel})
11. For grammar slides: Write the rules AND 6-8 example sentences demonstrating the structure

### VISUAL DESCRIPTIONS - CRITICAL:
12. When slide content references images students need to see (e.g., "Look at the images", "Identify these devices"), the visualDescription MUST specify EXACTLY what to generate
13. Example BAD: "Bright colorful collage of tech devices" 
    Example GOOD: "Generate these specific items in a grid layout: 1) iPhone 14 showing Instagram app, 2) MacBook Pro laptop, 3) iPad tablet displaying YouTube, 4) Apple Watch, 5) Facebook logo icon, 6) TikTok logo icon, 7) Snapchat logo icon"
14. Be specific: list each item/image students need to see and identify
15. Age-appropriate styling: Young learners (cartoon style), Teens (modern/cool), Adults (realistic/professional)

### CEFR-SPECIFIC SCAFFOLDING:
16. ${cefrLevel === 'A1' || cefrLevel === 'A2' ? 'Heavy scaffolding: 80% controlled practice with clear examples, sentence frames, word banks. Short simple sentences.' : ''}
17. ${cefrLevel === 'B1' || cefrLevel === 'B2' ? 'Balanced scaffolding: 50% controlled, 50% freer practice. Mix simple and complex structures. Gradually remove support.' : ''}
18. ${cefrLevel === 'C1' || cefrLevel === 'C2' ? 'Light scaffolding: 20% controlled practice, 80% fluency focus. Complex structures, nuanced language, minimal support.' : ''}

### INTERACTION PATTERNS & STT:
19. Specify interactionPattern for each slide: "Individual", "Pairs", "Small Groups", or "Whole Class"
20. Progression: Individual → Pairs → Small Groups → Whole Class
21. Aim for 70-80% Student Talking Time overall
22. Practice stage: Start individual, move to pairs, then groups
23. Production stage: Maximize pair/group work

Generate a pedagogically sound, well-balanced lesson with proper PPP ratios, age-appropriate activities, CEFR-aligned scaffolding, and high Student Talking Time.`;

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
