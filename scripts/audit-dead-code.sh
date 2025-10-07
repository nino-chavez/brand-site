#!/bin/bash

# Dead Code Audit Script
# Finds orphaned components that are never imported

set -e

echo "🔍 Dead Code Audit"
echo "=================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DEAD_CODE_COUNT=0
REPORT_FILE="DEAD_CODE_AUDIT_$(date +%Y-%m-%d).md"

echo "# Dead Code Audit Report" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Find all component files (exclude node_modules, dist, test files)
find_components() {
    find . -type f \
        \( -name "*.tsx" -o -name "*.ts" \) \
        ! -path "*/node_modules/*" \
        ! -path "*/dist/*" \
        ! -path "*/.next/*" \
        ! -path "*/coverage/*" \
        ! -name "*.test.ts*" \
        ! -name "*.spec.ts*" \
        ! -name "*.stories.ts*" \
        ! -name "vite.config.*" \
        ! -name "vitest.config.*"
}

# Extract exported component/function names from a file
get_exports() {
    local file="$1"
    # Match: export default ComponentName, export const ComponentName, export function ComponentName
    grep -E "^export (default |const |function |class )" "$file" 2>/dev/null | \
        sed -E 's/export default //; s/export (const|function|class) //; s/[=:({].*//; s/ //g' | \
        grep -v "^$"
}

# Check if component is imported anywhere
is_imported() {
    local component="$1"
    local file="$2"
    local filename=$(basename "$file" | sed 's/\.[^.]*$//')

    # Search for imports of this component (excluding the file itself)
    # Match: import ComponentName from, import { ComponentName }, import * as ComponentName
    local import_count=$(grep -r \
        --include="*.ts" \
        --include="*.tsx" \
        --include="*.js" \
        --include="*.jsx" \
        --exclude-dir=node_modules \
        --exclude-dir=dist \
        --exclude-dir=.next \
        -E "(import.*['\"].*${filename}['\"]|import.*${component})" \
        . 2>/dev/null | \
        grep -v "^${file}:" | \
        wc -l | tr -d ' ')

    echo "$import_count"
}

echo "📂 Scanning components..."
echo ""

COMPONENTS=$(find_components)
TOTAL=$(echo "$COMPONENTS" | wc -l | tr -d ' ')
CURRENT=0

echo "## Dead Code Findings" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

for file in $COMPONENTS; do
    CURRENT=$((CURRENT + 1))

    # Skip entry points and config files
    case "$file" in
        */main.tsx|*/index.tsx|*/App.tsx|*/SimpleRouter.tsx)
            continue
            ;;
    esac

    # Get component name from filename
    filename=$(basename "$file" | sed 's/\.[^.]*$//')

    # Check if imported
    import_count=$(is_imported "$filename" "$file")

    if [ "$import_count" -eq "0" ]; then
        echo -e "${RED}❌ DEAD CODE:${NC} $file"
        echo "   └─ No imports found"

        # Add to report
        echo "### 🔴 $file" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "**Status:** Not imported anywhere" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "\`\`\`bash" >> "$REPORT_FILE"
        echo "# To remove:" >> "$REPORT_FILE"
        echo "git rm \"$file\"" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"

        DEAD_CODE_COUNT=$((DEAD_CODE_COUNT + 1))
    fi
done

echo ""
echo "=================="
if [ "$DEAD_CODE_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✅ No dead code found!${NC}"
else
    echo -e "${YELLOW}Found $DEAD_CODE_COUNT dead code file(s)${NC}"
    echo ""
    echo "📄 Full report: $REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- Total files scanned: $TOTAL" >> "$REPORT_FILE"
echo "- Dead code files found: $DEAD_CODE_COUNT" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ "$DEAD_CODE_COUNT" -gt "0" ]; then
    echo "## Recommended Actions" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "1. Review each dead code file to confirm it's truly unused" >> "$REPORT_FILE"
    echo "2. Check git history to understand why it was created" >> "$REPORT_FILE"
    echo "3. Remove confirmed dead code to reduce bundle size and maintenance burden" >> "$REPORT_FILE"
    echo "4. Consider archiving instead of deleting if code may be useful for reference" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

exit 0
