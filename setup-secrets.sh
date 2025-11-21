#!/bin/bash

# 🔐 Firebase Secrets Setup Script
# This script helps you configure all required secrets for CareerLens

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   🔐 Firebase Secrets Setup           ║"
echo "║   CareerLens Configuration            ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI is not installed${NC}"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi

# Login check
echo -e "${BLUE}Checking Firebase authentication...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}Please login to Firebase:${NC}"
    firebase login
fi

echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# Select project
echo -e "${BLUE}Setting Firebase project...${NC}"
firebase use careerlens-1

echo ""
echo -e "${YELLOW}This script will help you set up all required secrets.${NC}"
echo -e "${YELLOW}You can skip any secret by pressing Enter without input.${NC}"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local description=$2
    local required=$3
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Setting: $secret_name${NC}"
    echo -e "${BLUE}$description${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ "$required" = "required" ]; then
        echo -e "${RED}* REQUIRED${NC}"
    else
        echo -e "${YELLOW}(Optional - press Enter to skip)${NC}"
    fi
    
    read -p "Enter value: " secret_value
    
    if [ -z "$secret_value" ]; then
        if [ "$required" = "required" ]; then
            echo -e "${RED}✗ This secret is required!${NC}"
            return 1
        else
            echo -e "${YELLOW}⊘ Skipped${NC}"
            return 0
        fi
    fi
    
    echo "$secret_value" | firebase apphosting:secrets:set "$secret_name" --data-file=-
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Secret $secret_name set successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to set secret $secret_name${NC}"
        return 1
    fi
}

# Required Secrets
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  REQUIRED SECRETS                         ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"

set_secret "GEMINI_API_KEY" "Get from: https://aistudio.google.com/app/apikey" "required" || exit 1
set_secret "GOOGLE_GENAI_API_KEY" "Same as GEMINI_API_KEY (can paste same value)" "required" || exit 1
set_secret "NEWS_API_KEY" "Get from: https://newsapi.org/register (Free tier available)" "required" || exit 1

# Optional but recommended secrets
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}  OPTIONAL SECRETS (Recommended)          ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"

set_secret "NEWS_API_KEY" "Get from: https://newsapi.org/register" "optional"
set_secret "GOOGLE_CUSTOM_SEARCH_API_KEY" "Get from: https://console.cloud.google.com/apis/credentials" "optional"
set_secret "GOOGLE_CUSTOM_SEARCH_ENGINE_ID" "Get from: https://programmablesearchengine.google.com/" "optional"

# Redis secrets
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  REDIS CONFIGURATION                      ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

set_secret "REDIS_HOST" "Redis server hostname (e.g., 10.0.0.1)" "optional"
set_secret "REDIS_PASSWORD" "Redis authentication password" "optional"

# Reddit API
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  REDDIT API (for Career Updates)          ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

set_secret "REDDIT_CLIENT_ID" "Get from: https://www.reddit.com/prefs/apps" "optional"
set_secret "REDDIT_CLIENT_SECRET" "Reddit OAuth client secret" "optional"

# Summary
echo ""
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Secrets Setup Complete!          ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Verify secrets in Firebase Console:"
echo "   https://console.firebase.google.com/project/careerlens-1/settings/secrets"
echo ""
echo "2. Create a new rollout in Firebase Console:"
echo "   App Hosting → careerlens backend → Create rollout"
echo ""
echo "3. Or deploy from command line:"
echo "   firebase deploy"
echo ""
echo -e "${BLUE}Note: If you skipped optional secrets, the related features may not work.${NC}"
echo -e "${BLUE}You can add them later using: firebase apphosting:secrets:set SECRET_NAME${NC}"
echo ""
