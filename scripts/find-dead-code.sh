#!/bin/bash
# Find TypeScript/TSX files that are never imported
# Helps prevent editing dead code by identifying orphaned components

echo "🔍 Scanning for dead code (never imported components)..."
echo ""

DEAD_CODE_FOUND=0

# Entry points and special files that don't need to be imported
ENTRY_POINTS=(
  "src/index.tsx"
  "src/main.tsx"
  "src/entry-client.tsx"
  "src/entry-server.tsx"
  "index.ts"
  "index.tsx"
  "vite.config.ts"
  "tailwind.config.ts"
)

is_entry_point() {
  local file=$1
  for entry in "${ENTRY_POINTS[@]}"; do
    if [[ "$file" == *"$entry" ]]; then
      return 0
    fi
  done
  return 1
}

for file in $(find src components -name "*.tsx" -o -name "*.ts" 2>/dev/null | grep -v ".stories." | grep -v ".test." | grep -v ".spec."); do
  # Skip if file doesn't exist (safety check)
  [ ! -f "$file" ] && continue

  # Skip entry points and index files
  if is_entry_point "$file"; then
    continue
  fi

  # Extract filename without extension and path
  basename_no_ext=$(basename "$file" .tsx)
  basename_no_ext=$(basename "$basename_no_ext" .ts)

  # Search for imports of this file across the codebase
  # Look for: import ... from 'path/to/file' or import('path/to/file')
  imports=$(grep -r "import.*['\"].*${basename_no_ext}['\"]" src components 2>/dev/null | \
            grep -v "^${file}:" | \
            grep -v ".stories." | \
            grep -v ".test." | \
            wc -l | tr -d ' ')

  # Also check for lazy imports: lazy(() => import(...))
  lazy_imports=$(grep -r "lazy.*import.*['\"].*${basename_no_ext}['\"]" src components 2>/dev/null | \
                 grep -v "^${file}:" | \
                 wc -l | tr -d ' ')

  total_imports=$((imports + lazy_imports))

  if [ "$total_imports" -eq "0" ]; then
    echo "❌ DEAD CODE: $file (never imported)"
    DEAD_CODE_FOUND=$((DEAD_CODE_FOUND + 1))
  fi
done

echo ""
if [ "$DEAD_CODE_FOUND" -eq "0" ]; then
  echo "✅ No dead code found!"
  exit 0
else
  echo "⚠️  Found $DEAD_CODE_FOUND file(s) that appear to be dead code"
  echo ""
  echo "NOTE: Some files may be entry points, utilities, or types imported via barrel exports."
  echo "To verify a file is truly dead code, run:"
  echo "  grep -r \"import.*ComponentName\" src/ components/ --include=\"*.ts\" --include=\"*.tsx\""
  echo ""
  echo "Consider reviewing and removing truly unused files to prevent future editing mistakes."
  exit 1
fi
