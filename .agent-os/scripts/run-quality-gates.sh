#!/bin/bash
# Run all documentation quality gates locally
# Matches the CI/CD pipeline validation

set -e

echo "🚀 Running Documentation Quality Gates..."
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
overall_status=0
gates_passed=0
gates_warning=0
gates_failed=0

# Gate 1: Documentation Structure
echo -e "${BLUE}📁 Gate 1: Documentation Structure${NC}"
if .agent-os/scripts/validate-docs-structure.sh; then
  echo -e "${GREEN}✅ Structure validation passed${NC}"
  ((gates_passed++))
else
  echo -e "${RED}❌ Structure validation failed${NC}"
  ((gates_failed++))
  overall_status=1
fi
echo ""

# Gate 2: Link Validation
echo -e "${BLUE}🔗 Gate 2: Link Validation${NC}"
if .agent-os/scripts/check-doc-links.sh; then
  echo -e "${GREEN}✅ Link validation passed${NC}"
  ((gates_passed++))
else
  echo -e "${RED}❌ Link validation failed${NC}"
  ((gates_failed++))
  overall_status=1
fi
echo ""

# Gate 3: Diagram Validation (warning only)
echo -e "${BLUE}📊 Gate 3: Mermaid Diagram Validation (warning only)${NC}"
files=$(find docs .agent-os -name "*.md" -type f)
diagram_errors=0

for file in $files; do
  mermaid_count=$(grep -c '```mermaid' "$file" 2>/dev/null || true)
  if [ "$mermaid_count" -gt 0 ]; then
    if grep -A 50 '```mermaid' "$file" | grep -q 'graph\|sequenceDiagram\|classDiagram'; then
      : # Valid
    else
      echo -e "${YELLOW}⚠️  Potential syntax issue in $file${NC}"
      ((diagram_errors++))
    fi
  fi
done

if [ $diagram_errors -eq 0 ]; then
  echo -e "${GREEN}✅ Diagram validation passed${NC}"
  ((gates_passed++))
else
  echo -e "${YELLOW}⚠️  Found $diagram_errors potential diagram issue(s)${NC}"
  ((gates_warning++))
fi
echo ""

# Gate 4: Coverage Report
echo -e "${BLUE}📈 Gate 4: Documentation Coverage${NC}"
total_files=$(find docs -name "*.md" -type f | wc -l)
files_with_diagrams=$(find docs -name "*.md" -type f -exec grep -l '```mermaid' {} \; 2>/dev/null | wc -l)
total_diagrams=$(find docs -name "*.md" -type f -exec grep -c '```mermaid' {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}')
files_with_refs=$(find docs -name "*.md" -type f -exec grep -l 'src/.*\.tsx\?:' {} \; 2>/dev/null | wc -l)
total_refs=$(find docs -name "*.md" -type f -exec grep -c 'src/.*\.tsx\?:' {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}')

diagram_coverage=$((files_with_diagrams * 100 / total_files))

echo "  Total files: $total_files"
echo "  Files with diagrams: $files_with_diagrams ($diagram_coverage%)"
echo "  Total diagrams: $total_diagrams"
echo "  Files with code refs: $files_with_refs"
echo "  Total code references: $total_refs"
echo -e "${GREEN}✅ Coverage report generated${NC}"
((gates_passed++))
echo ""

# Summary
echo "========================================"
echo -e "${BLUE}📊 Quality Gates Summary${NC}"
echo "========================================"
echo -e "✅ Passed: ${GREEN}$gates_passed${NC}"
echo -e "⚠️  Warnings: ${YELLOW}$gates_warning${NC}"
echo -e "❌ Failed: ${RED}$gates_failed${NC}"
echo ""

if [ $overall_status -eq 0 ]; then
  echo -e "${GREEN}🎉 All required quality gates passed!${NC}"
else
  echo -e "${RED}❌ Some quality gates failed. Please fix the issues above.${NC}"
fi

exit $overall_status