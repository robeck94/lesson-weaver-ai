#!/usr/bin/env node

/**
 * Slide Generator Migration Script
 * 
 * Copies all necessary files from this project to another Lovable project
 * 
 * Usage: node migrate-slide-generator.js /path/to/target/project
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Files to copy
const FILES_TO_COPY = {
  edgeFunctions: [
    'supabase/functions/generate-lesson/index.ts',
    'supabase/functions/generate-slide-image/index.ts',
    'supabase/functions/validate-slide-image/index.ts',
  ],
  components: [
    'src/pages/Index.tsx',
    'src/components/LessonInputForm.tsx',
    'src/components/LessonPreview.tsx',
    'src/components/ImageValidationWarning.tsx',
    'src/components/TeacherGuide.tsx',
    'src/components/PresentationMode.tsx',
  ],
  docs: [
    'EDGE_FUNCTIONS_COMPLETE.md',
    'QUICK_COPY_GUIDE.md',
    'SLIDE_GENERATOR_ARCHITECTURE.md',
  ]
};

const CONFIG_TOML_ADDITION = `
# Slide Generator Edge Functions
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
`;

function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
    log(`  Created directory: ${dirname}`, 'cyan');
  }
}

function copyFile(sourcePath, targetPath, options = {}) {
  try {
    if (!fs.existsSync(sourcePath)) {
      log(`  ⚠️  Source file not found: ${sourcePath}`, 'yellow');
      return false;
    }

    // Check if target exists
    if (fs.existsSync(targetPath) && !options.overwrite) {
      log(`  ⚠️  File already exists (skipping): ${targetPath}`, 'yellow');
      return false;
    }

    ensureDirectoryExists(targetPath);
    fs.copyFileSync(sourcePath, targetPath);
    log(`  ✓ Copied: ${sourcePath} → ${targetPath}`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ Error copying ${sourcePath}: ${error.message}`, 'red');
    return false;
  }
}

function updateConfigToml(targetProjectPath) {
  const configPath = path.join(targetProjectPath, 'supabase/config.toml');
  
  try {
    if (!fs.existsSync(configPath)) {
      log(`  Creating new config.toml`, 'cyan');
      ensureDirectoryExists(configPath);
      fs.writeFileSync(configPath, CONFIG_TOML_ADDITION.trim());
      log(`  ✓ Created config.toml with function entries`, 'green');
      return true;
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check if functions are already configured
    if (configContent.includes('[functions.generate-lesson]')) {
      log(`  ⚠️  Functions already configured in config.toml`, 'yellow');
      return false;
    }

    // Append to existing config
    fs.appendFileSync(configPath, CONFIG_TOML_ADDITION);
    log(`  ✓ Added function entries to config.toml`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ Error updating config.toml: ${error.message}`, 'red');
    return false;
  }
}

function checkDependencies(targetProjectPath) {
  const packageJsonPath = path.join(targetProjectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log(`  ⚠️  No package.json found in target project`, 'yellow');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = {
    '@supabase/supabase-js': '^2.0.0',
    'lucide-react': '^0.400.0',
    'sonner': '^1.0.0',
    'react-router-dom': '^6.0.0',
  };

  log('\n📦 Checking dependencies:', 'blue');
  let allPresent = true;

  for (const [dep, version] of Object.entries(requiredDeps)) {
    if (dependencies[dep]) {
      log(`  ✓ ${dep} (${dependencies[dep]})`, 'green');
    } else {
      log(`  ✗ Missing: ${dep}`, 'red');
      allPresent = false;
    }
  }

  if (!allPresent) {
    log('\n⚠️  Some dependencies are missing. Install them with:', 'yellow');
    log('  npm install @supabase/supabase-js lucide-react sonner react-router-dom', 'cyan');
  }
}

function createMigrationSummary(targetProjectPath) {
  const summaryPath = path.join(targetProjectPath, 'MIGRATION_SUMMARY.md');
  
  const summary = `# Slide Generator Migration Summary

This project has been set up with the Slide Generator feature.

## What Was Copied

### Edge Functions (Backend)
- \`supabase/functions/generate-lesson/index.ts\`
- \`supabase/functions/generate-slide-image/index.ts\`
- \`supabase/functions/validate-slide-image/index.ts\`

### React Components (Frontend)
- \`src/pages/Index.tsx\` (or SlideGenerator.tsx)
- \`src/components/LessonInputForm.tsx\`
- \`src/components/LessonPreview.tsx\`
- \`src/components/ImageValidationWarning.tsx\`
- \`src/components/TeacherGuide.tsx\`
- \`src/components/PresentationMode.tsx\`

### Documentation
- \`EDGE_FUNCTIONS_COMPLETE.md\`
- \`QUICK_COPY_GUIDE.md\`
- \`SLIDE_GENERATOR_ARCHITECTURE.md\`

## Next Steps

1. **Deploy Edge Functions** (automatic on next build)
   
2. **Add Route** to your router configuration:
   \`\`\`typescript
   {
     path: "/slide-generator",
     element: <Index />,
   }
   \`\`\`

3. **Test the Feature**:
   - Navigate to \`/slide-generator\`
   - Enter a topic (e.g., "Food and Restaurants")
   - Select CEFR level (e.g., "A2")
   - Click "Generate Lesson"
   - Wait ~30-60 seconds

4. **Verify Secrets**:
   - \`LOVABLE_API_KEY\` is automatically provided by Lovable Cloud
   - No manual configuration needed!

## Configuration

The following was added to \`supabase/config.toml\`:

\`\`\`toml
[functions.generate-lesson]
verify_jwt = false

[functions.generate-slide-image]
verify_jwt = false

[functions.validate-slide-image]
verify_jwt = false
\`\`\`

## How It Works

1. User enters topic + CEFR level
2. \`generate-lesson\` creates 12 pedagogically-sound slides
3. For each slide:
   - \`generate-slide-image\` generates an image
   - \`validate-slide-image\` checks accuracy
   - Auto-retries on validation failures (max 2 retries)
4. Complete lesson with validated images

## Troubleshooting

- **Functions not deploying**: They deploy automatically with your code
- **Rate limits**: 429 errors mean too many requests - add delays
- **No credits**: 402 errors mean you need to add credits to workspace
- **Images don't match content**: Validation will auto-retry with feedback

## Documentation

See the copied markdown files for complete details:
- \`EDGE_FUNCTIONS_COMPLETE.md\` - Full backend code
- \`QUICK_COPY_GUIDE.md\` - Integration strategies
- \`SLIDE_GENERATOR_ARCHITECTURE.md\` - System design

Migration completed on: ${new Date().toISOString()}
`;

  fs.writeFileSync(summaryPath, summary);
  log(`  ✓ Created MIGRATION_SUMMARY.md`, 'green');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('❌ Error: No target project path provided', 'red');
    log('\nUsage: node migrate-slide-generator.js /path/to/target/project', 'cyan');
    log('\nExample:', 'cyan');
    log('  node migrate-slide-generator.js ../my-other-lovable-project', 'yellow');
    process.exit(1);
  }

  const targetProjectPath = path.resolve(args[0]);
  const sourceProjectPath = __dirname;

  log('\n🚀 Slide Generator Migration Tool\n', 'blue');
  log(`Source: ${sourceProjectPath}`, 'cyan');
  log(`Target: ${targetProjectPath}\n`, 'cyan');

  // Verify target exists
  if (!fs.existsSync(targetProjectPath)) {
    log(`❌ Target project not found: ${targetProjectPath}`, 'red');
    process.exit(1);
  }

  let copiedFiles = 0;
  let skippedFiles = 0;

  // Copy Edge Functions
  log('📁 Copying Edge Functions...', 'blue');
  FILES_TO_COPY.edgeFunctions.forEach(file => {
    const source = path.join(sourceProjectPath, file);
    const target = path.join(targetProjectPath, file);
    if (copyFile(source, target)) {
      copiedFiles++;
    } else {
      skippedFiles++;
    }
  });

  // Copy Components
  log('\n📁 Copying React Components...', 'blue');
  FILES_TO_COPY.components.forEach(file => {
    const source = path.join(sourceProjectPath, file);
    let target = path.join(targetProjectPath, file);
    
    // Rename Index.tsx to SlideGenerator.tsx in target to avoid conflicts
    if (file === 'src/pages/Index.tsx') {
      target = path.join(targetProjectPath, 'src/pages/SlideGenerator.tsx');
      log('  (Renaming Index.tsx → SlideGenerator.tsx to avoid conflicts)', 'yellow');
    }
    
    if (copyFile(source, target)) {
      copiedFiles++;
    } else {
      skippedFiles++;
    }
  });

  // Copy Documentation
  log('\n📁 Copying Documentation...', 'blue');
  FILES_TO_COPY.docs.forEach(file => {
    const source = path.join(sourceProjectPath, file);
    const target = path.join(targetProjectPath, file);
    if (copyFile(source, target)) {
      copiedFiles++;
    } else {
      skippedFiles++;
    }
  });

  // Update config.toml
  log('\n⚙️  Updating Supabase Config...', 'blue');
  updateConfigToml(targetProjectPath);

  // Check dependencies
  checkDependencies(targetProjectPath);

  // Create migration summary
  log('\n📝 Creating Migration Summary...', 'blue');
  createMigrationSummary(targetProjectPath);

  // Final summary
  log('\n✅ Migration Complete!', 'green');
  log(`\n📊 Summary:`, 'blue');
  log(`  Copied: ${copiedFiles} files`, 'green');
  log(`  Skipped: ${skippedFiles} files (already exist)`, 'yellow');

  log('\n📋 Next Steps:', 'blue');
  log('  1. Add route to your router:', 'cyan');
  log('     { path: "/slide-generator", element: <SlideGenerator /> }', 'yellow');
  log('  2. Import: import SlideGenerator from "@/pages/SlideGenerator"', 'yellow');
  log('  3. Test at /slide-generator', 'yellow');
  log('  4. Check MIGRATION_SUMMARY.md for details\n', 'yellow');
}

main();
