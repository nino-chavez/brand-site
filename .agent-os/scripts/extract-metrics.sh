#!/bin/bash
# Extract Project Metrics
# Collects LOC, test coverage, bundle size, and other metrics

set -e

echo "📊 Extracting Project Metrics..."
echo "================================"
echo ""

# Output files
METRICS_DIR=".agent-os/metrics"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
METRICS_FILE="$METRICS_DIR/project-metrics-$TIMESTAMP.json"
LATEST_LINK="$METRICS_DIR/project-metrics-latest.json"

mkdir -p "$METRICS_DIR"

# Initialize JSON
cat > "$METRICS_FILE" << 'EOF'
{
  "timestamp": "TIMESTAMP_PLACEHOLDER",
  "metrics": {
EOF

# Replace timestamp
sed -i.bak "s/TIMESTAMP_PLACEHOLDER/$(date -u +%Y-%m-%dT%H:%M:%SZ)/" "$METRICS_FILE"
rm -f "$METRICS_FILE.bak"

echo "📏 Metric 1: Lines of Code"
echo "  Counting source files..."

# TypeScript/TSX
if command -v cloc &> /dev/null; then
  echo "  Using cloc for accurate counting..."
  cloc_output=$(cloc src --json --quiet 2>/dev/null || echo '{}')

  ts_lines=$(echo "$cloc_output" | grep -o '"TypeScript":{[^}]*"code":[0-9]*' | grep -o '[0-9]*$' || echo "0")
  tsx_lines=$(echo "$cloc_output" | grep -o '"TSX":{[^}]*"code":[0-9]*' | grep -o '[0-9]*$' || echo "0")
  css_lines=$(echo "$cloc_output" | grep -o '"CSS":{[^}]*"code":[0-9]*' | grep -o '[0-9]*$' || echo "0")

  total_lines=$((ts_lines + tsx_lines + css_lines))
else
  echo "  Using basic line counting..."
  ts_lines=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
  css_lines=$(find src -name "*.css" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
  total_lines=$((ts_lines + css_lines))
  tsx_lines=0
fi

echo "    TypeScript: $ts_lines lines"
echo "    TSX: $tsx_lines lines"
echo "    CSS: $css_lines lines"
echo "    Total: $total_lines lines"
echo ""

echo "🧪 Metric 2: Test Coverage"
echo "  Analyzing test files..."

# Count test files
test_files=$(find test -name "*.test.ts*" -o -name "*.spec.ts*" 2>/dev/null | wc -l || echo "0")
test_lines=$(find test -name "*.test.ts*" -o -name "*.spec.ts*" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")

# Try to get coverage from package.json scripts or vitest output
coverage_percent="0"
if [ -f "coverage/coverage-summary.json" ]; then
  coverage_percent=$(cat coverage/coverage-summary.json | grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*' | grep -o 'pct":[0-9.]*' | cut -d: -f2 || echo "0")
fi

# No heredoc needed

echo "    Test files: $test_files"
echo "    Test lines: $test_lines"
echo "    Coverage: ${coverage_percent}%"
echo ""

echo "📦 Metric 3: Bundle Size"
echo "  Checking build artifacts..."

# Check for build output
bundle_size="0"
bundle_bytes=0
if [ -d "dist" ]; then
  bundle_size=$(du -sh dist 2>/dev/null | awk '{print $1}' || echo "0")
  # Use -sk for macOS compatibility, multiply by 1024 for bytes
  bundle_bytes=$(du -sk dist 2>/dev/null | awk '{print $1*1024}' || echo "0")
else
  bundle_size="0"
  bundle_bytes=0
fi

# No heredoc needed

echo "    Bundle size: $bundle_size"
echo ""

echo "📁 Metric 4: File Counts"
echo "  Counting project files..."

# Count different file types
component_files=$(find src/components -name "*.tsx" 2>/dev/null | wc -l || echo "0")
hook_files=$(find src/hooks -name "*.ts*" 2>/dev/null | wc -l || echo "0")
context_files=$(find src/contexts -name "*.tsx" 2>/dev/null | wc -l || echo "0")
util_files=$(find src/utils -name "*.ts" 2>/dev/null | wc -l || echo "0")
type_files=$(find src/types -name "*.ts" 2>/dev/null | wc -l || echo "0")

# No heredoc needed

echo "    Components: $component_files"
echo "    Hooks: $hook_files"
echo "    Contexts: $context_files"
echo "    Utilities: $util_files"
echo "    Types: $type_files"
echo ""

echo "📊 Metric 5: Documentation Coverage"
echo "  Analyzing documentation..."

doc_files=$(find docs -name "*.md" 2>/dev/null | wc -l || echo "0")
doc_with_diagrams=$(find docs -name "*.md" -exec grep -l '```mermaid' {} \; 2>/dev/null | wc -l || echo "0")
total_diagrams=$(find docs -name "*.md" -exec grep -c '```mermaid' {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
doc_with_refs=$(find docs -name "*.md" -exec grep -l 'src/.*\.tsx\?:' {} \; 2>/dev/null | wc -l || echo "0")
total_refs=$(find docs -name "*.md" -exec grep -c 'src/.*\.tsx\?:' {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

# No heredoc needed

echo "    Documentation files: $doc_files"
echo "    Files with diagrams: $doc_with_diagrams"
echo "    Total diagrams: $total_diagrams"
echo "    Files with code refs: $doc_with_refs"
echo "    Diagram coverage: $((doc_with_diagrams * 100 / doc_files))%"
echo ""

echo "📈 Metric 6: Git Statistics"
echo "  Analyzing repository..."

total_commits=$(git rev-list --all --count 2>/dev/null || echo "0")
contributors=$(git log --format='%ae' | sort -u | wc -l || echo "0")
latest_commit=$(git log -1 --format='%h - %s' 2>/dev/null || echo "No commits")

# No heredoc needed

echo "    Total commits: $total_commits"
echo "    Contributors: $contributors"
echo "    Latest: $latest_commit"
echo ""

# Write JSON data directly (proper formatting)
cat >> "$METRICS_FILE" << EOF
    "lines_of_code": {
      "typescript": $ts_lines,
      "tsx": $tsx_lines,
      "css": $css_lines,
      "total": $total_lines
    },
    "test_coverage": {
      "test_files": $test_files,
      "test_lines": $test_lines,
      "coverage_percent": $coverage_percent
    },
    "bundle_size": {
      "human_readable": "$bundle_size",
      "bytes": $bundle_bytes
    },
    "file_counts": {
      "components": $component_files,
      "hooks": $hook_files,
      "contexts": $context_files,
      "utilities": $util_files,
      "types": $type_files
    },
    "documentation": {
      "total_files": $doc_files,
      "files_with_diagrams": $doc_with_diagrams,
      "total_diagrams": $total_diagrams,
      "files_with_code_refs": $doc_with_refs,
      "total_code_refs": $total_refs,
      "diagram_coverage_percent": $((doc_with_diagrams * 100 / doc_files))
    },
    "git_stats": {
      "total_commits": $total_commits,
      "contributors": $contributors,
      "latest_commit": "$latest_commit"
    }
  }
}
EOF

# Create symlink to latest
rm -f "$LATEST_LINK"
ln -s "$(basename "$METRICS_FILE")" "$LATEST_LINK"

echo "================================"
echo "✅ Metrics extracted successfully"
echo ""
echo "📄 Saved to: $METRICS_FILE"
echo "🔗 Latest: $LATEST_LINK"
echo ""

# Pretty print summary
if command -v jq &> /dev/null; then
  echo "📊 Metrics Summary:"
  jq '.metrics' "$METRICS_FILE"
fi