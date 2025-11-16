#!/bin/bash

# Slide Generator Migration Script (Bash version)
# Usage: ./migrate-slide-generator.sh /path/to/target/project

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: No target project path provided${NC}"
    echo -e "\n${CYAN}Usage: ./migrate-slide-generator.sh /path/to/target/project${NC}"
    echo -e "\n${CYAN}Example:${NC}"
    echo -e "  ${YELLOW}./migrate-slide-generator.sh ../my-other-lovable-project${NC}"
    exit 1
fi

TARGET_PROJECT="$1"
SOURCE_PROJECT="$(pwd)"

echo -e "\n${BLUE}🚀 Slide Generator Migration Tool${NC}\n"
echo -e "${CYAN}Source: $SOURCE_PROJECT${NC}"
echo -e "${CYAN}Target: $TARGET_PROJECT${NC}\n"

# Verify target exists
if [ ! -d "$TARGET_PROJECT" ]; then
    echo -e "${RED}❌ Target project not found: $TARGET_PROJECT${NC}"
    exit 1
fi

COPIED=0
SKIPPED=0

# Function to copy file
copy_file() {
    local source="$1"
    local target="$2"
    local rename_msg="$3"
    
    if [ ! -f "$source" ]; then
        echo -e "  ${YELLOW}⚠️  Source file not found: $source${NC}"
        return 1
    fi
    
    if [ -f "$target" ]; then
        echo -e "  ${YELLOW}⚠️  File already exists (skipping): $target${NC}"
        ((SKIPPED++))
        return 1
    fi
    
    # Create directory if needed
    mkdir -p "$(dirname "$target")"
    
    # Copy file
    cp "$source" "$target"
    
    if [ -n "$rename_msg" ]; then
        echo -e "  ${GREEN}✓ Copied: $source → $target ${YELLOW}($rename_msg)${NC}"
    else
        echo -e "  ${GREEN}✓ Copied: $source → $target${NC}"
    fi
    
    ((COPIED++))
    return 0
}

# Copy Edge Functions
echo -e "${BLUE}📁 Copying Edge Functions...${NC}"
copy_file "$SOURCE_PROJECT/supabase/functions/generate-lesson/index.ts" \
          "$TARGET_PROJECT/supabase/functions/generate-lesson/index.ts"
copy_file "$SOURCE_PROJECT/supabase/functions/generate-slide-image/index.ts" \
          "$TARGET_PROJECT/supabase/functions/generate-slide-image/index.ts"
copy_file "$SOURCE_PROJECT/supabase/functions/validate-slide-image/index.ts" \
          "$TARGET_PROJECT/supabase/functions/validate-slide-image/index.ts"

# Copy React Components
echo -e "\n${BLUE}📁 Copying React Components...${NC}"
echo -e "  ${YELLOW}(Renaming Index.tsx → SlideGenerator.tsx to avoid conflicts)${NC}"
copy_file "$SOURCE_PROJECT/src/pages/Index.tsx" \
          "$TARGET_PROJECT/src/pages/SlideGenerator.tsx" \
          "renamed"
copy_file "$SOURCE_PROJECT/src/components/LessonInputForm.tsx" \
          "$TARGET_PROJECT/src/components/LessonInputForm.tsx"
copy_file "$SOURCE_PROJECT/src/components/LessonPreview.tsx" \
          "$TARGET_PROJECT/src/components/LessonPreview.tsx"
copy_file "$SOURCE_PROJECT/src/components/ImageValidationWarning.tsx" \
          "$TARGET_PROJECT/src/components/ImageValidationWarning.tsx"
copy_file "$SOURCE_PROJECT/src/components/TeacherGuide.tsx" \
          "$TARGET_PROJECT/src/components/TeacherGuide.tsx"
copy_file "$SOURCE_PROJECT/src/components/PresentationMode.tsx" \
          "$TARGET_PROJECT/src/components/PresentationMode.tsx"

# Copy Documentation
echo -e "\n${BLUE}📁 Copying Documentation...${NC}"
copy_file "$SOURCE_PROJECT/EDGE_FUNCTIONS_COMPLETE.md" \
          "$TARGET_PROJECT/EDGE_FUNCTIONS_COMPLETE.md"
copy_file "$SOURCE_PROJECT/QUICK_COPY_GUIDE.md" \
          "$TARGET_PROJECT/QUICK_COPY_GUIDE.md"
copy_file "$SOURCE_PROJECT/SLIDE_GENERATOR_ARCHITECTURE.md" \
          "$TARGET_PROJECT/SLIDE_GENERATOR_ARCHITECTURE.md"

# Update config.toml
echo -e "\n${BLUE}⚙️  Updating Supabase Config...${NC}"
CONFIG_FILE="$TARGET_PROJECT/supabase/config.toml"

CONFIG_ADDITION="
# Slide Generator Edge Functions
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
"

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "  ${CYAN}Creating new config.toml${NC}"
    mkdir -p "$TARGET_PROJECT/supabase"
    echo "$CONFIG_ADDITION" > "$CONFIG_FILE"
    echo -e "  ${GREEN}✓ Created config.toml with function entries${NC}"
elif grep -q "\[functions.generate-lesson\]" "$CONFIG_FILE"; then
    echo -e "  ${YELLOW}⚠️  Functions already configured in config.toml${NC}"
else
    echo "$CONFIG_ADDITION" >> "$CONFIG_FILE"
    echo -e "  ${GREEN}✓ Added function entries to config.toml${NC}"
fi

# Check dependencies
echo -e "\n${BLUE}📦 Checking dependencies...${NC}"
PACKAGE_JSON="$TARGET_PROJECT/package.json"

if [ ! -f "$PACKAGE_JSON" ]; then
    echo -e "  ${YELLOW}⚠️  No package.json found in target project${NC}"
else
    MISSING_DEPS=()
    
    check_dep() {
        if ! grep -q "\"$1\"" "$PACKAGE_JSON"; then
            MISSING_DEPS+=("$1")
            echo -e "  ${RED}✗ Missing: $1${NC}"
        else
            echo -e "  ${GREEN}✓ $1${NC}"
        fi
    }
    
    check_dep "@supabase/supabase-js"
    check_dep "lucide-react"
    check_dep "sonner"
    check_dep "react-router-dom"
    
    if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
        echo -e "\n${YELLOW}⚠️  Some dependencies are missing. Install them with:${NC}"
        echo -e "  ${CYAN}npm install @supabase/supabase-js lucide-react sonner react-router-dom${NC}"
    fi
fi

# Create migration summary
echo -e "\n${BLUE}📝 Creating Migration Summary...${NC}"
cat > "$TARGET_PROJECT/MIGRATION_SUMMARY.md" << 'EOF'
# Slide Generator Migration Summary

This project has been set up with the Slide Generator feature.

## What Was Copied

### Edge Functions (Backend)
- `supabase/functions/generate-lesson/index.ts`
- `supabase/functions/generate-slide-image/index.ts`
- `supabase/functions/validate-slide-image/index.ts`

### React Components (Frontend)
- `src/pages/SlideGenerator.tsx` (renamed from Index.tsx)
- `src/components/LessonInputForm.tsx`
- `src/components/LessonPreview.tsx`
- `src/components/ImageValidationWarning.tsx`
- `src/components/TeacherGuide.tsx`
- `src/components/PresentationMode.tsx`

### Documentation
- `EDGE_FUNCTIONS_COMPLETE.md`
- `QUICK_COPY_GUIDE.md`
- `SLIDE_GENERATOR_ARCHITECTURE.md`

## Next Steps

1. **Add Route** to your router configuration:
   ```typescript
   import SlideGenerator from "@/pages/SlideGenerator";
   
   {
     path: "/slide-generator",
     element: <SlideGenerator />,
   }
   ```

2. **Test the Feature**:
   - Navigate to `/slide-generator`
   - Enter a topic (e.g., "Food and Restaurants")
   - Select CEFR level (e.g., "A2")
   - Click "Generate Lesson"
   - Wait ~30-60 seconds

3. **Verify Secrets**:
   - `LOVABLE_API_KEY` is automatically provided by Lovable Cloud
   - No manual configuration needed!

## Configuration

The following was added to `supabase/config.toml`:

```toml
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
```

## Troubleshooting

- **Functions not deploying**: They deploy automatically with your code
- **Rate limits**: 429 errors mean too many requests - add delays
- **No credits**: 402 errors mean you need to add credits to workspace
- **Images don't match content**: Validation will auto-retry with feedback

Migration completed: $(date)
EOF

echo -e "  ${GREEN}✓ Created MIGRATION_SUMMARY.md${NC}"

# Final summary
echo -e "\n${GREEN}✅ Migration Complete!${NC}"
echo -e "\n${BLUE}📊 Summary:${NC}"
echo -e "  ${GREEN}Copied: $COPIED files${NC}"
echo -e "  ${YELLOW}Skipped: $SKIPPED files (already exist)${NC}"

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo -e "  ${CYAN}1. Add route to your router:${NC}"
echo -e "     ${YELLOW}{ path: \"/slide-generator\", element: <SlideGenerator /> }${NC}"
echo -e "  ${CYAN}2. Import:${NC}"
echo -e "     ${YELLOW}import SlideGenerator from \"@/pages/SlideGenerator\"${NC}"
echo -e "  ${CYAN}3. Test at /slide-generator${NC}"
echo -e "  ${CYAN}4. Check MIGRATION_SUMMARY.md for details${NC}\n"
