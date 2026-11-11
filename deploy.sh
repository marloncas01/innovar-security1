#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  INNOVAR SECURITY — DEPLOYMENT SCRIPT  ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# =====================================================
# 1. CHECK REQUIRED TOOLS
# =====================================================
echo -e "${YELLOW}[1/7] Checking required tools...${NC}"

check_tool() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}  ✗ $1 is not installed. Please install $1 first.${NC}"
    exit 1
  fi
  local ver=$($1 --version 2>/dev/null | head -1)
  echo -e "${GREEN}  ✓ $1 found: ${ver}${NC}"
}

check_tool node
check_tool npm
check_tool git

echo ""

# =====================================================
# 2. VALIDATE ENVIRONMENT VARIABLES
# =====================================================
echo -e "${YELLOW}[2/7] Validating environment variables...${NC}"

cd "$PROJECT_DIR"

if [ ! -f ".env" ]; then
  echo -e "${RED}  ✗ .env file not found. Copy .env.example to .env and configure it.${NC}"
  exit 1
fi

source .env

REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
)

MISSING=0
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}  ✗ Missing required env: $var${NC}"
    MISSING=1
  else
    echo -e "${GREEN}  ✓ $var is set${NC}"
  fi
done

if [ "$MISSING" -eq 1 ]; then
  echo -e "${RED}  Fix missing env variables in .env before deploying.${NC}"
  exit 1
fi

echo ""

# =====================================================
# 3. TYPESCRIPT CHECK
# =====================================================
echo -e "${YELLOW}[3/7] Running TypeScript check...${NC}"

if npx tsc --noEmit 2>&1; then
  echo -e "${GREEN}  ✓ TypeScript check passed${NC}"
else
  echo -e "${RED}  ✗ TypeScript check failed. Fix type errors before deploying.${NC}"
  exit 1
fi

echo ""

# =====================================================
# 4. ESLINT
# =====================================================
echo -e "${YELLOW}[4/7] Running ESLint...${NC}"

if npm run lint 2>&1; then
  echo -e "${GREEN}  ✓ Lint passed${NC}"
else
  echo -e "${RED}  ✗ Lint failed. Fix lint errors before deploying.${NC}"
  exit 1
fi

echo ""

# =====================================================
# 5. RUN TESTS
# =====================================================
echo -e "${YELLOW}[5/7] Running tests...${NC}"

TEST_FILES=$(ls test-fase*.js 2>/dev/null | head -20)
if [ -z "$TEST_FILES" ]; then
  echo -e "${YELLOW}  ⚠ No test files found, skipping tests.${NC}"
else
  for test_file in $TEST_FILES; do
    echo -e "  Running ${BLUE}${test_file}${NC}..."
    if node "$test_file" 2>&1; then
      echo -e "${GREEN}  ✓ ${test_file} passed${NC}"
    else
      echo -e "${RED}  ✗ ${test_file} failed${NC}"
      exit 1
    fi
  done
fi

echo ""

# =====================================================
# 6. BUILD
# =====================================================
echo -e "${YELLOW}[6/7] Building project...${NC}"

npm run build 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}  ✓ Build successful${NC}"
else
  echo -e "${RED}  ✗ Build failed${NC}"
  exit 1
fi

echo ""

# =====================================================
# 7. RAILWAY DEPLOYMENT INSTRUCTIONS
# =====================================================
echo -e "${YELLOW}[7/7] Railway deployment instructions${NC}"
echo ""
echo -e "${BLUE}  Option A: Push to Git (auto-deploy)${NC}"
echo "    1. git add . && git commit -m 'Deploy: $(date +%Y-%m-%d_%H-%M)'"
echo "    2. git push origin main"
echo "    3. Railway auto-deploys on push to linked branch"
echo ""
echo -e "${BLUE}  Option B: Railway CLI${NC}"
echo "    1. npm i -g @railway/cli"
echo "    2. railway login"
echo "    3. railway link"
echo "    4. railway up"
echo ""
echo -e "${BLUE}  Option C: Railway Dashboard${NC}"
echo "    1. Go to https://railway.app/dashboard"
echo "    2. Select project → Deployments → Deploy Now"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  DEPLOYMENT READY — All checks passed!  ${NC}"
echo -e "${GREEN}========================================${NC}"
