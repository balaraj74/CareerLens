#!/bin/bash

# CareerLens Real-Time Data System - Verification Script
# This script verifies that all services are properly created and configured

echo "🔍 CareerLens Real-Time Data System - Verification"
echo "=================================================="
echo ""

# Check if services exist
echo "📁 Checking Service Files..."
FILES=(
  "src/lib/reddit-api-service.ts"
  "src/lib/google-search-service.ts"
  "src/lib/web-scraper-service.ts"
  "src/lib/ai-summarizer-service.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    echo "  ✅ $file ($lines lines)"
  else
    echo "  ❌ $file (MISSING)"
  fi
done

echo ""
echo "📄 Checking Documentation..."
DOCS=(
  "docs/REAL_TIME_DATA_SYSTEM.md"
  "docs/IMPLEMENTATION_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    lines=$(wc -l < "$doc")
    echo "  ✅ $doc ($lines lines)"
  else
    echo "  ❌ $doc (MISSING)"
  fi
done

echo ""
echo "🔧 Checking Configuration..."
if [ -f ".env.local.example" ]; then
  if grep -q "GOOGLE_SEARCH_API_KEY" .env.local.example; then
    echo "  ✅ API key placeholders added to .env.local.example"
  else
    echo "  ❌ API keys not found in .env.local.example"
  fi
else
  echo "  ❌ .env.local.example not found"
fi

echo ""
echo "🔨 Running TypeScript Check..."
npx tsc --noEmit --skipLibCheck \
  src/lib/reddit-api-service.ts \
  src/lib/google-search-service.ts \
  src/lib/web-scraper-service.ts \
  src/lib/ai-summarizer-service.ts 2>&1

if [ $? -eq 0 ]; then
  echo "  ✅ All TypeScript checks passed!"
else
  echo "  ❌ TypeScript errors found (see above)"
  exit 1
fi

echo ""
echo "📊 Summary Statistics"
echo "===================="
total_lines=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    total_lines=$((total_lines + lines))
  fi
done

echo "  • Services Created: ${#FILES[@]}"
echo "  • Total Code Lines: $total_lines"
echo "  • Documentation Files: ${#DOCS[@]}"
echo ""

echo "✅ Verification Complete!"
echo ""
echo "📝 Next Steps:"
echo "  1. Copy .env.local.example to .env.local"
echo "  2. Add your Google Search API credentials"
echo "  3. Test services with: npm run dev"
echo "  4. Continue with Task 5: Firebase Cloud Functions"
echo ""
