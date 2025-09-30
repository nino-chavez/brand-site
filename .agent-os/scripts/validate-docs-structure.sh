#!/bin/bash
# Documentation Structure Validation
# Ensures docs/ organization follows established patterns

set -e

echo "🔍 Validating documentation structure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0

# Check showcase/ directory
check_showcase() {
  echo "  Checking showcase/ directory..."

  # Ensure no developer-specific content
  if grep -r "TODO\|FIXME\|implementation detail\|internal only" docs/showcase/ 2>/dev/null; then
    echo -e "${RED}ERROR: showcase/ contains developer notes${NC}"
    ((errors++))
  fi

  # Ensure all files have end-user appropriate language
  if grep -r "src/components\|\.tsx\|\.ts:" docs/showcase/ | grep -v "technical-architecture" 2>/dev/null; then
    echo -e "${YELLOW}WARNING: showcase/ has code-specific references${NC}"
  fi
}

# Check developer/ directory
check_developer() {
  echo "  Checking developer/ directory..."

  # Ensure no marketing language
  if grep -r "revolutionary\|game-changing\|world-class" docs/developer/ 2>/dev/null; then
    echo -e "${YELLOW}WARNING: developer/ contains marketing language${NC}"
  fi

  # Check for required subdirectories
  required_dirs=("deployment" "guides" "monitoring" "analytics")
  for dir in "${required_dirs[@]}"; do
    if [ ! -d "docs/developer/$dir" ]; then
      echo -e "${RED}ERROR: Missing required directory: developer/$dir${NC}"
      ((errors++))
    fi
  done
}

# Check components/ directory
check_components() {
  echo "  Checking components/ directory..."

  # Ensure API documentation structure
  required_dirs=("api" "design-language")
  for dir in "${required_dirs[@]}"; do
    if [ ! -d "docs/components/$dir" ]; then
      echo -e "${RED}ERROR: Missing required directory: components/$dir${NC}"
      ((errors++))
    fi
  done
}

# Check archive/ directory
check_archive() {
  echo "  Checking archive/ directory..."

  # Ensure no active references to archive
  active_docs=$(find docs/showcase docs/developer docs/components -name "*.md" 2>/dev/null)
  if echo "$active_docs" | xargs grep -l "docs/archive/" 2>/dev/null; then
    echo -e "${RED}ERROR: Active docs reference archived content${NC}"
    ((errors++))
  fi

  # Check for archive README
  if [ ! -f "docs/archive/README.md" ]; then
    echo -e "${RED}ERROR: Missing docs/archive/README.md${NC}"
    ((errors++))
  fi
}

# Check root docs/ directory
check_root() {
  echo "  Checking docs/ root directory..."

  # Should only have README.md and directories
  root_files=$(find docs/ -maxdepth 1 -type f -name "*.md" | wc -l | tr -d ' ')
  if [ "$root_files" -ne 1 ]; then
    echo -e "${YELLOW}WARNING: docs/ root has $root_files markdown files (expected 1)${NC}"
    find docs/ -maxdepth 1 -type f -name "*.md"
  fi
}

# Run all checks
check_showcase
check_developer
check_components
check_archive
check_root

# Report results
echo ""
if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✅ Documentation structure validation passed${NC}"
  exit 0
else
  echo -e "${RED}❌ Documentation structure validation failed with $errors error(s)${NC}"
  exit 1
fi