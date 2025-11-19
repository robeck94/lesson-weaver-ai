#!/bin/bash

# Quick Copy Script for Slide Generator
# Usage: ./copy-to-project.sh /path/to/target/project

set -e

if [ -z "$1" ]; then
  echo "❌ Usage: ./copy-to-project.sh /path/to/target/project"
  exit 1
fi

TARGET="$1"
SOURCE="$(pwd)"

echo "📦 Copying Slide Generator to: $TARGET"
echo ""

# Backend files
echo "📤 Copying backend..."
mkdir -p "$TARGET/supabase/functions/generate-lesson"
mkdir -p "$TARGET/supabase/functions/generate-slide-image"
mkdir -p "$TARGET/supabase/functions/validate-slide-image"

cp "$SOURCE/supabase/functions/generate-lesson/index.ts" "$TARGET/supabase/functions/generate-lesson/"
cp "$SOURCE/supabase/functions/generate-slide-image/index.ts" "$TARGET/supabase/functions/generate-slide-image/"
cp "$SOURCE/supabase/functions/validate-slide-image/index.ts" "$TARGET/supabase/functions/validate-slide-image/"

# Frontend files
echo "📤 Copying frontend..."
mkdir -p "$TARGET/src/pages"
mkdir -p "$TARGET/src/components/games"

cp "$SOURCE/src/pages/Index.tsx" "$TARGET/src/pages/"
cp "$SOURCE/src/pages/GameTemplates.tsx" "$TARGET/src/pages/"
cp "$SOURCE/src/components/LessonInputForm.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/LessonPreview.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/ImageValidationWarning.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/TeacherGuide.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/PresentationMode.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/RemixOptions.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/QuizSlide.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/DialogueActivity.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/FillInTheBlankActivity.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/MatchingActivity.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/RolePlayActivity.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/SentenceOrderingActivity.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/TrueFalseActivity.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/WordScrambleActivity.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/ImageGenerator.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/NavLink.tsx" "$TARGET/src/components/"
cp "$SOURCE/src/components/games/GameCustomizer.tsx" "$TARGET/src/components/games/"
cp "$SOURCE/src/components/games/GameTemplateCard.tsx" "$TARGET/src/components/games/"

# Update config.toml
echo "⚙️  Updating config.toml..."
CONFIG="$TARGET/supabase/config.toml"

if ! grep -q "\[functions.generate-lesson\]" "$CONFIG" 2>/dev/null; then
  cat >> "$CONFIG" << 'EOF'

[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
EOF
  echo "✅ Added function configs"
else
  echo "⚠️  Functions already in config.toml"
fi

echo ""
echo "✅ Done! Files copied to: $TARGET"
echo ""
echo "Next steps:"
echo "1. cd $TARGET"
echo "2. git add ."
echo "3. git commit -m 'Add slide generator'"
echo "4. git push"
echo ""
echo "Lovable will auto-sync the changes! 🚀"
