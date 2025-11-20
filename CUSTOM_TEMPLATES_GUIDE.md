# Custom Prompt Templates Guide

## Overview

Custom Prompt Templates allow teachers to define their own teaching style and preferences for lesson generation. This feature enables personalized lesson creation that matches each teacher's unique approach to ESL instruction.

## Features

### Template Management
- **Create** custom templates with your preferred teaching style
- **Edit** existing templates to refine your preferences
- **Delete** templates you no longer need
- **Select** templates when generating lessons

### Customization Options

#### 1. Teaching Style
Choose from predefined styles:
- **Interactive**: Focus on student participation and engagement
- **Structured**: Organized, systematic approach with clear progression
- **Playful**: Game-based, fun, and lighthearted
- **Academic**: Formal, scholarly approach with emphasis on accuracy
- **Conversational**: Natural, dialogue-focused learning
- **Game-Based**: Heavy use of games and competitive activities

#### 2. Tone
Set the overall tone of your lessons:
- **Friendly**: Warm, approachable language
- **Professional**: Formal, business-like communication
- **Enthusiastic**: Energetic, motivating language
- **Calm**: Measured, soothing approach
- **Motivating**: Encouraging, inspirational tone

#### 3. Activity Preferences
Select your preferred activity types (choose multiple):
- Matching Activities
- Fill-in-the-Blank
- Word Scrambles
- Sentence Ordering
- True/False Questions
- Dialogue Completion
- Role-play Scenarios
- Games
- Group Work
- Pair Work

#### 4. Emphasis Areas
Choose what to focus on in your lessons:
- Vocabulary
- Grammar
- Speaking
- Listening
- Reading
- Writing
- Pronunciation
- Fluency

#### 5. Custom Instructions
Add specific instructions or preferences in free text format. Examples:
- "Use real-world examples from technology industry"
- "Include pronunciation tips for Spanish speakers"
- "Focus on British English spelling and vocabulary"
- "Add cultural notes about American customs"

## How to Use

### Creating a Template

1. Click **"Manage Templates"** button on the lesson creation form
2. In the Template Manager dialog, click **"New Template"**
3. Fill in the template form:
   - **Name**: Give your template a memorable name (e.g., "Interactive & Fun")
   - **Description**: Brief description of the template
   - **Teaching Style**: Select your preferred style
   - **Tone**: Choose the tone
   - **Activity Preferences**: Click badges to select/deselect
   - **Emphasis Areas**: Click badges to select/deselect
   - **Custom Instructions**: Add any specific instructions
4. Click **"Create Template"**

### Using a Template

1. When creating a lesson, click **"Manage Templates"**
2. Browse your saved templates
3. Click **"Use This Template"** on your desired template
4. The template will be applied to your lesson generation
5. Generate your lesson as usual - the AI will incorporate your preferences

### Editing a Template

1. Open the Template Manager
2. Hover over a template card to reveal the edit button
3. Click the edit icon
4. Modify your preferences
5. Click **"Update Template"**

### Deleting a Template

1. Open the Template Manager
2. Hover over a template card to reveal the delete button
3. Click the delete icon
4. Confirm deletion

## Storage

Templates are currently stored in your browser's localStorage, which means:
- ✅ Templates are instantly available
- ✅ No account required
- ✅ Works offline
- ⚠️ Templates are local to your browser
- ⚠️ Clearing browser data will delete templates
- ⚠️ Templates don't sync across devices

> **Note**: Future updates may add database storage with user authentication for cross-device sync.

## Examples

### Example 1: Business English Template
```
Name: Corporate Trainer
Teaching Style: Professional
Tone: Professional
Activity Preferences: Role-play, Group Work, Dialogue Completion
Emphasis Areas: Speaking, Vocabulary, Grammar
Custom Instructions: Focus on business vocabulary and workplace scenarios. 
Include email writing and meeting situations.
```

### Example 2: Young Learners Template
```
Name: Fun for Kids
Teaching Style: Playful
Tone: Enthusiastic
Activity Preferences: Games, Matching Activities, Word Scrambles
Emphasis Areas: Vocabulary, Speaking, Pronunciation
Custom Instructions: Use simple language and colorful examples. 
Include lots of movement and songs.
```

### Example 3: Exam Preparation Template
```
Name: IELTS Prep
Teaching Style: Structured
Tone: Professional
Activity Preferences: Fill-in-the-Blank, Sentence Ordering, True/False
Emphasis Areas: Grammar, Writing, Reading, Vocabulary
Custom Instructions: Focus on IELTS task types. Include timing strategies 
and scoring criteria explanations.
```

## Technical Details

### Files
- **Frontend Components**:
  - `src/components/TemplateManager.tsx` - Template management UI
  - `src/components/LessonInputForm.tsx` - Updated with template selector
- **Types**: `src/types/template.ts` - Template type definitions
- **Hooks**: `src/hooks/useTemplates.ts` - Template CRUD operations
- **Backend**: `supabase/functions/generate-lesson/index.ts` - Template integration

### Integration with AI
When a template is selected, the system:
1. Extracts preferences from the template
2. Constructs additional prompt instructions
3. Prepends these instructions to the base system prompt
4. Sends the enhanced prompt to the AI model
5. AI generates lesson incorporating all preferences

### Data Structure
```typescript
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  teachingStyle: string;
  activityPreferences: string[];
  emphasisAreas: string[];
  customInstructions: string;
  tone: string;
  createdAt: string;
  updatedAt: string;
}
```

## Best Practices

1. **Start Simple**: Create a basic template first, test it, then refine
2. **Be Specific**: Use custom instructions to add very specific requirements
3. **Name Clearly**: Use descriptive names that indicate the template's purpose
4. **Test Variations**: Create multiple templates for different class types
5. **Iterate**: Update templates based on lesson quality feedback
6. **Share Knowledge**: Document successful template configurations

## Troubleshooting

**Q: My template doesn't seem to affect the lesson**
- Check that you selected the template before clicking "Generate Lesson"
- Verify your custom instructions are clear and specific
- Remember: the AI still follows base requirements (JSON format, slide structure, etc.)

**Q: My templates disappeared**
- Templates are stored in browser localStorage
- Check if you cleared browser data or used a different browser/device
- Create a backup by exporting your templates (feature coming soon)

**Q: Can I share templates with colleagues?**
- Currently not supported - templates are local to your browser
- Future update will add template export/import functionality

## Future Enhancements

Planned features:
- 📤 Export/Import templates as JSON files
- 🔄 Template versioning and history
- 👥 Template sharing between users
- 💾 Cloud storage with user authentication
- 📊 Template analytics (which templates generate best lessons)
- 🎨 Template categories and tags
- 🔍 Template search and filtering

## Feedback

If you have suggestions for improving the template system or encounter issues, please share your feedback!
