# Slide Generator Migration Tool

Automated script to copy the complete Slide Generator feature to another Lovable project.

## Quick Start

```bash
node migrate-slide-generator.js /path/to/your/other/project
```

## What It Does

✅ Copies 3 edge functions (backend)  
✅ Copies 6 React components (frontend)  
✅ Copies 3 documentation files  
✅ Updates `supabase/config.toml`  
✅ Checks dependencies  
✅ Creates migration summary  
✅ Renames Index.tsx → SlideGenerator.tsx to avoid conflicts

## Prerequisites

- Node.js installed on your system
- Both projects (source and target) accessible on your filesystem
- Target project must be a Lovable project with:
  - `src/` directory for components
  - `supabase/functions/` directory for edge functions

## Usage Examples

### Example 1: Sibling directory
```bash
node migrate-slide-generator.js ../my-other-project
```

### Example 2: Absolute path
```bash
node migrate-slide-generator.js /Users/username/projects/my-app
```

### Example 3: From anywhere
```bash
cd /path/to/this/project
node migrate-slide-generator.js /path/to/target/project
```

## Files Copied

### Backend (3 files)
```
supabase/functions/
├── generate-lesson/index.ts       (833 lines)
├── generate-slide-image/index.ts  (125 lines)
└── validate-slide-image/index.ts  (163 lines)
```

### Frontend (6 files)
```
src/
├── pages/SlideGenerator.tsx       (renamed from Index.tsx)
└── components/
    ├── LessonInputForm.tsx
    ├── LessonPreview.tsx
    ├── ImageValidationWarning.tsx
    ├── TeacherGuide.tsx
    └── PresentationMode.tsx
```

### Documentation (3 files)
```
├── EDGE_FUNCTIONS_COMPLETE.md
├── QUICK_COPY_GUIDE.md
└── SLIDE_GENERATOR_ARCHITECTURE.md
```

## After Migration

### 1. Add Route
Add to your router configuration:

```typescript
import SlideGenerator from "@/pages/SlideGenerator";

// In your routes array:
{
  path: "/slide-generator",
  element: <SlideGenerator />
}
```

### 2. Add Navigation (Optional)
Add a link in your navbar:

```tsx
<Link to="/slide-generator">Slide Generator</Link>
```

### 3. Test
1. Start your dev server
2. Navigate to `/slide-generator`
3. Generate a test lesson:
   - Topic: "Food and Restaurants"
   - Level: "A2"
   - Click "Generate Lesson"
   - Wait ~30-60 seconds

### 4. Verify
Check that:
- ✅ Form appears
- ✅ Generation progress shows
- ✅ Slides appear with images
- ✅ No console errors

## Troubleshooting

### Script fails with "Target project not found"
**Solution:** Check the path is correct and the directory exists

### "Some dependencies are missing"
**Solution:** Run the suggested npm install command

### Files show as "already exists (skipping)"
**Solution:** This is safe - existing files are preserved. Delete them first if you want to overwrite.

### Edge functions don't deploy
**Solution:** They deploy automatically with your code. Push changes to trigger deployment.

### Rate limit errors (429)
**Solution:** You're making too many requests. Add delays between generations.

### Credit errors (402)
**Solution:** Add credits to your Lovable workspace in Settings → Workspace → Usage

## What Gets Updated

### supabase/config.toml
Adds function configuration:
```toml
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
```

### No changes to:
- package.json (you install deps manually if needed)
- Router configuration (you add route manually)
- Environment variables (automatic via Lovable Cloud)

## Safety Features

✅ **Non-destructive:** Skips files that already exist  
✅ **Creates directories:** Automatically creates missing folders  
✅ **Preserves content:** Appends to config.toml instead of overwriting  
✅ **Detailed logging:** Shows what's happening at each step  
✅ **Summary report:** Creates MIGRATION_SUMMARY.md for reference

## Required Dependencies

The script checks for these in your target project:

- `@supabase/supabase-js` (^2.0.0)
- `lucide-react` (^0.400.0)
- `sonner` (^1.0.0)
- `react-router-dom` (^6.0.0)

If missing, install with:
```bash
npm install @supabase/supabase-js lucide-react sonner react-router-dom
```

## Configuration

### Making Changes Before Migration
Edit `migrate-slide-generator.js` to:
- Change target filenames
- Skip certain files
- Customize config.toml additions
- Modify logging output

### Making Changes After Migration
All files are now in your target project and can be edited:
- Customize prompts in edge functions
- Adjust UI components
- Modify validation logic
- Update pedagogical rules

## Advanced Usage

### Dry Run (Check without copying)
Comment out the `copyFile` and `updateConfigToml` calls to see what would be copied:

```javascript
// if (copyFile(source, target)) {
log(`  Would copy: ${source} → ${target}`, 'cyan');
// }
```

### Selective Copy
Edit the `FILES_TO_COPY` object to copy only specific files:

```javascript
const FILES_TO_COPY = {
  edgeFunctions: [
    'supabase/functions/generate-lesson/index.ts',
    // Comment out others to skip them
  ],
  // ...
};
```

## Support

For issues or questions:
1. Check `MIGRATION_SUMMARY.md` in your target project
2. Review `EDGE_FUNCTIONS_COMPLETE.md` for backend details
3. See `SLIDE_GENERATOR_ARCHITECTURE.md` for system design

## License

Same as the source project - copy freely!
