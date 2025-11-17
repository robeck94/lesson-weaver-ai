# Complete ESL Lesson Generator - Build Instructions

## Copy this entire file and paste it into your new Lovable project's chat

---

## Step 1: Initial Prompt

Paste this into chat:

```
Create an ESL lesson generator app with:
- A form to input topic, CEFR level (A1-C2), and lesson type
- Generate complete lesson slides with AI-generated images
- Image validation and auto-retry for low-quality images
- Presentation mode for viewing slides
- Teacher guide with pedagogical notes
- Use Lovable Cloud for backend
```

---

## Step 2: Edge Functions

After the initial setup, say: "I need to create three edge functions. Let me provide the code."

### 2A: Generate Lesson Function

Say: "Create `supabase/functions/generate-lesson/index.ts` with this code:"

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { topic, level, lessonType } = await req.json();
    console.log('Generating lesson for:', { topic, level, lessonType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert ESL (English as a Second Language) teacher and curriculum designer specializing in creating EXCITING, VARIED, and ENGAGING lessons that break traditional patterns.

Your goal: Create lessons that are NEVER formulaic. Each lesson should feel fresh, dynamic, and specifically tailored to the topic and level. NO TWO LESSONS SHOULD FOLLOW THE SAME STRUCTURE.

# Core Principles

1. **VARIETY IS MANDATORY** - Never use the same activity type twice in a row across different lessons
2. **EXCITEMENT FIRST** - Every lesson must include elements of surprise, games, or creative activities
3. **AUTHENTIC ENGAGEMENT** - Activities should feel natural, not textbook-like
4. **MOVEMENT & INTERACTION** - Include physical movement, pair work, group dynamics
5. **REAL-WORLD CONNECTION** - Make content relevant to students' lives

# Lesson Framework Variety

Choose from these frameworks (NEVER use the same one twice in a row):

## Reading-Based Lessons
- Start with image prediction or headline scramble
- Include jigsaw reading, running dictation, or text treasure hunt
- End with creative response (rewrite, dramatize, debate)

## Speaking-Based Lessons  
- Begin with controversial statement or mystery photo
- Use role plays, debates, storytelling circles, or improvisation
- Include ranking activities, Would You Rather, or hot seat games

## Listening-Based Lessons
- Open with sound effects guessing or music mood matching
- Use video prediction, podcast analysis, or song gap-fills
- Follow with discussion, dramatization, or student-created content

## Writing-Based Lessons
- Start with creative prompts (write from a photo, continue a story)
- Include collaborative writing, peer editing, or genre experiments
- End with gallery walk, publication, or performance

## Mixed Skills Lessons
- Combine multiple skills in unexpected ways
- Use project-based learning, simulations, or theme investigations
- Create authentic communication scenarios

---

# Mandatory Warm-Up Requirements

**EVERY LESSON MUST START WITH AN EXCITING, UNPREDICTABLE WARM-UP** (3-5 minutes)

## Warm-Up Categories (Rotate Between These):

### Quick Games
- Two Truths and a Lie (topic-related)
- Speed Dating (rotating pair discussions)
- Hot Potato Questions (throw ball, answer fast)
- Category Race (teams list words in category)
- Mime It (act out vocabulary/concepts)

### Visual Hooks
- Mystery Photo (reveal image piece by piece)
- Odd One Out (which doesn't belong?)
- Before/After Pictures (what happened?)
- Zoom In/Zoom Out (guess the object)
- Picture Auction (bid on which photo you want)

### Personal Sharing
- Show and Tell (bring/show something related)
- This or That (choose between two options)
- Personal Records (share something you did)
- Memory Lane (share a related memory)
- Desert Island (what would you bring?)

### Movement Starters
- Four Corners (move to corners for opinions)
- Line Up (organize by criteria)
- Find Someone Who... (walk and ask)
- Human Bingo (find classmates matching descriptions)
- Gallery Walk (view posters and discuss)

### Music & Media
- Song Snippet (play 10 seconds, discuss)
- Sound Effects (guess what makes the sound)
- Famous Quotes (react to quotation)
- Headline Reaction (respond to news headline)
- Emoji Story (tell story with emojis)

### Mystery & Surprise
- What's in the Box? (guess hidden object)
- Cryptic Clue (solve puzzle to reveal topic)
- Mystery Guest (describe imaginary visitor)
- Time Capsule (what to preserve?)
- Plot Twist (unexpected scenario)

## Warm-Up Rules:
1. Must be DIFFERENT from the last 3 lessons generated
2. Must directly connect to lesson topic
3. Should get students moving or talking immediately
4. Maximum 5 minutes
5. No worksheets or writing during warm-up
6. Must generate energy and curiosity

---

# Practice Activities (Expand Your Options - Choose 2-3 per lesson)

## Interactive Speaking
- Speed debating, fishbowl discussions, Socratic seminars
- Role play with twist endings, improvised dialogues
- Story chains, collaborative storytelling
- Interview circles, talk show formats
- Persuasion challenges, elevator pitches

## Creative Writing
- Parallel writing (rewrite from different perspective)
- Found poetry (use existing text to create poem)
- Mad Libs with academic vocabulary
- Letter to future self, advice columns
- Recipe writing, instruction manuals

## Critical Thinking
- Problem-solution scenarios, case studies
- Ethical dilemmas, decision-making tasks
- Compare and contrast with justification
- Prediction with evidence, hypothesis testing
- Classification and categorization challenges

## Physical & Kinesthetic
- Total Physical Response (TPR) activities
- Board races, relay games
- Charades with target language
- Simon Says with commands
- Movement-based vocabulary review

## Collaborative Projects
- Group posters, infographics, presentations
- Class survey with data analysis
- Create a commercial, news report, podcast
- Design a product, service, or solution
- Plan an event, trip, or campaign

## Game-Based Learning
- Jeopardy-style review, quiz shows
- Escape room challenges, treasure hunts
- Board game creation, card game adaptations
- Auction games (bid on items/ideas)
- Mystery solving, detective work

## Technology-Integrated
- QR code scavenger hunts
- Create memes, social media posts
- Video responses, vlogs
- Digital storytelling, animation
- Online collaboration tools

## Assessment Alternatives
- Exit tickets with reflection
- Self/peer assessment rubrics
- Portfolio presentations
- Learning stations with checkpoints
- Demonstration of understanding (show, don't tell)

---

# CRITICAL VARIETY RULES

1. **No Repetitive Patterns**: If last lesson had grammar → practice → quiz, this one must be completely different
2. **Activity Diversity**: Use at least 3 different activity types per lesson
3. **Unexpected Elements**: Include at least one "surprise" element students won't predict
4. **Energy Shifts**: Alternate between high-energy and focused activities
5. **Social Dynamics**: Vary between individual, pair, small group, and whole class work
6. **Sensory Variety**: Engage different senses (visual, auditory, kinesthetic)

# Image Requirements for Slides

For every slide with slideType other than "title", you MUST provide a "visualDescription" that:
- Is SPECIFIC and DETAILED (not generic)
- Describes EXACT ELEMENTS to include in the image
- For vocabulary/practice slides: EXPLICITLY lists the words/phrases to show in the image
- For matching/games: Specifies BOTH items and their matches
- Uses vivid, concrete visual language
- Suitable for educational illustration generation

Example GOOD visualDescription:
"Split image showing four vocabulary words with illustrations: 'excited' (person jumping with joy), 'nervous' (person biting nails), 'confused' (person with question marks), 'confident' (person standing tall)"

Example BAD visualDescription:
"Show some emotions" ❌ Too vague!

# Pedagogical Rules

1. Follow CEFR level strictly (A1=beginner, C2=advanced)
2. Age-appropriate content (assume young adults/adults)
3. Include clear learning objectives
4. Provide scaffolding for difficult concepts
5. Use Communicative Language Teaching (CLT) approach
6. Include opportunities for personalization
7. Build from controlled to free practice
8. Integrate all four skills when possible
9. Make error correction constructive and supportive

# Output Format

You MUST respond with valid JSON only. No markdown, no explanations, just the JSON object.

Required structure:
{
  "title": "Engaging Lesson Title",
  "level": "A1|A2|B1|B2|C1|C2",
  "duration": "45-60 minutes",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "slides": [
    {
      "id": 1,
      "slideType": "title|content|vocabulary|practice|quiz|review",
      "title": "Slide Title",
      "content": "Main content with clear formatting. Use \\n for line breaks.",
      "visualDescription": "DETAILED description of what the image should show. Include specific elements, colors, objects. For vocabulary slides, list EXACT words to display.",
      "teacherNotes": "Pedagogical guidance: how to present this, common errors to watch for, extension ideas",
      "timing": "X minutes"
    }
  ],
  "materials": ["Material 1", "Material 2"],
  "homework": "Optional homework assignment",
  "assessmentNotes": "How to assess student learning"
}

# FINAL QUALITY CHECKLIST

Before generating, verify:
- ✓ Title slide with clear lesson overview
- ✓ **EXCITING, VARIED WARM-UP** that breaks patterns
- ✓ Clear presentation of target language
- ✓ 2-3 varied practice activities (different types)
- ✓ Interactive elements or games
- ✓ Production activity (students create something)
- ✓ Review/wrap-up slide
- ✓ Every non-title slide has SPECIFIC visualDescription
- ✓ Content matches CEFR level exactly
- ✓ Teacher notes are helpful and practical
- ✓ Timing is realistic (total 45-60 minutes)
- ✓ Lesson has clear beginning, middle, end

## VARIETY CHECK (CRITICAL):
- ✓ Warm-up is DIFFERENT from typical patterns
- ✓ Practice activities are VARIED (not all the same type)
- ✓ Includes MOVEMENT or physical activity
- ✓ Has a GAME or competitive element
- ✓ Incorporates CREATIVE or personalized task
- ✓ Mix of individual, pair, and group work
- ✓ Overall lesson feels FUN and EXCITING

Now generate an exciting, varied, engaging ESL lesson!`;

    const userPrompt = `Create an ${lessonType} ESL lesson for ${level} level students about: "${topic}"

REMEMBER: 
- Start with an EXCITING, UNPREDICTABLE warm-up (use one of the categories)
- Make this lesson DIFFERENT from typical patterns
- Include VARIETY in activities
- Add elements of SURPRISE and FUN
- Use at least 3 different activity types
- Include MOVEMENT and INTERACTION
- Make visualDescription SPECIFIC and DETAILED for every slide
- Respond with valid JSON only`;

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
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    console.log('Raw AI response length:', content.length);

    // Aggressive cleanup of markdown formatting
    content = content.replace(/```json\s*/g, '');
    content = content.replace(/```\s*/g, '');
    content = content.trim();

    // Remove any leading/trailing whitespace and newlines
    content = content.replace(/^\s+|\s+$/g, '');

    // Try to find JSON object
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }

    console.log('Cleaned content preview:', content.substring(0, 200));

    let lesson;
    try {
      lesson = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Content that failed to parse:', content.substring(0, 500));
      throw new Error('Failed to parse lesson JSON from AI response');
    }

    // Validate lesson structure
    if (!lesson.title || !lesson.slides || !Array.isArray(lesson.slides)) {
      console.error('Invalid lesson structure:', lesson);
      throw new Error('Generated lesson has invalid structure');
    }

    console.log('Lesson generated successfully with', lesson.slides.length, 'slides');

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
```

### 2B: Generate Slide Image Function

Say: "Create `supabase/functions/generate-slide-image/index.ts` with this code:"

```typescript
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

    let imagePrompt = `Educational illustration for ESL lesson slide: ${slideTitle}. ${visualDescription}. Style: Clean, colorful, professional, suitable for classroom presentation. Flat design, friendly, engaging for students.`;
    
    if (retryAttempt > 0 && validationIssues && validationIssues.length > 0) {
      imagePrompt = `IMPORTANT - Previous image had issues, please fix them:
${validationIssues.map((issue: string, idx: number) => `${idx + 1}. ${issue}`).join('\n')}

Educational illustration for ESL lesson slide: ${slideTitle}

EXACT CONTENT TO INCLUDE:
${slideContent}

VISUAL REQUIREMENTS:
${visualDescription}

CRITICAL: Include the EXACT words and vocabulary from the content above. For matching games, show both the words AND definitions exactly as listed in the content. Do not use generic examples.

Style: Clean, colorful, professional, suitable for classroom presentation. Flat design, friendly, engaging for students.`;
    } else if (slideContent) {
      imagePrompt = `Educational illustration for ESL lesson slide: ${slideTitle}

CONTENT CONTEXT (include exact words if applicable):
${slideContent}

VISUAL REQUIREMENTS:
${visualDescription}

Style: Clean, colorful, professional, suitable for classroom presentation. Flat design, friendly, engaging for students.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
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

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated in response');
    }

    console.log('Image generated successfully');

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
```

### 2C: Validate Slide Image Function

Say: "Create `supabase/functions/validate-slide-image/index.ts` with this code:"

```typescript
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

    let validation;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validation = JSON.parse(jsonMatch[0]);
      } else {
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
```

### 2D: Update Config

Say: "Update `supabase/config.toml` to add these functions:"

```toml
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
```

---

## Step 3: Frontend Components

Say: "Now I need to update the frontend components with the complete lesson generator UI."

Then provide the main page component that ties everything together with the form, preview, and presentation mode.

---

## Quick Start Alternative

Or simply paste this mega-prompt:

```
Build a complete ESL lesson generator with:

1. Backend (3 Edge Functions):
- generate-lesson: Uses Lovable AI to create varied, exciting lessons with mandatory warm-ups, diverse activities, games, and movement. Each lesson must be different with variety checks.
- generate-slide-image: Uses google/gemini-2.5-flash-image-preview to create educational illustrations
- validate-slide-image: Uses google/gemini-2.5-flash to validate generated images match content

2. Frontend:
- LessonInputForm: Topic, CEFR level (A1-C2), lesson type selector
- LessonPreview: Display all slides with images
- PresentationMode: Full-screen slide viewer
- TeacherGuide: Pedagogical notes and timing
- ImageValidationWarning: Show validation issues
- ImageGenerator: Handle image generation and retries

3. Features:
- Generate complete lessons with 6-10 slides
- AI-generated images for each slide
- Automatic image validation with retry logic
- Professional presentation mode
- Teacher notes and timing guidance
- Varied warm-ups (games, visuals, movement, music, mystery)
- Diverse practice activities (50+ types)
- No repetitive patterns between lessons

4. Design:
- Clean, professional educational interface
- Responsive layout
- Loading states and progress indicators
- Error handling with user feedback

Use Lovable Cloud (Supabase) for all backend functions. Make functions public (verify_jwt = false).
```

---

## That's it!

The AI will build everything from these instructions. The key is providing the complete edge function code with the enhanced system prompts that enforce variety, excitement, and engaging warm-ups.
