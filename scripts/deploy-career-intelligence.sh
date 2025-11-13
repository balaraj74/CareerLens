#!/bin/bash

# AI Career Intelligence Hub - Deployment Script
# Deploys Cloud Functions and updates Firestore rules

set -e

echo "🚀 Deploying AI Career Intelligence Hub..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Step 1: Build and deploy Cloud Functions
echo -e "${BLUE}📦 Step 1: Building Cloud Functions...${NC}"
cd functions
npm install
npm run build
cd ..

echo -e "${GREEN}✅ Cloud Functions built successfully${NC}"
echo ""

# Step 2: Deploy Firestore Rules
echo -e "${BLUE}🔒 Step 2: Deploying Firestore Rules...${NC}"
firebase deploy --only firestore:rules

echo -e "${GREEN}✅ Firestore rules deployed${NC}"
echo ""

# Step 3: Deploy Cloud Functions
echo -e "${BLUE}☁️  Step 3: Deploying Cloud Functions...${NC}"
firebase deploy --only functions:fetchCareerUpdates,functions:refreshCareerUpdates

echo -e "${GREEN}✅ Cloud Functions deployed${NC}"
echo ""

# Step 4: Test the deployment
echo -e "${BLUE}🧪 Step 4: Testing deployment...${NC}"
FUNCTION_URL="https://us-central1-careerlens-1.cloudfunctions.net/refreshCareerUpdates"

echo "Testing manual refresh endpoint..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" -w "\n%{http_code}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Function is working correctly${NC}"
else
    echo -e "${YELLOW}⚠️  Function returned HTTP $HTTP_CODE${NC}"
    echo "Response: $RESPONSE"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Add NEWS_API_KEY to functions/.env"
echo "2. Visit https://your-app.com/career-updates"
echo "3. Click 'Refresh Now' to fetch initial data"
echo ""
echo "📊 Monitor logs:"
echo "   firebase functions:log --follow"
echo ""
echo "🔗 Function URL:"
echo "   $FUNCTION_URL"
