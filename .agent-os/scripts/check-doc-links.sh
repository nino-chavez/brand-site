#!/bin/bash
# Documentation Link Validation
# Ensures all internal markdown links resolve correctly

echo "🔗 Checking markdown links..."

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

errors=0
error_count=0

# Find all markdown files
find docs/ -name "*.md" | while read -r file; do
  # Extract markdown links [text](path)
  # Matches: [text](path) but not [text](http://...)
  # Also filters out regex patterns and code examples
  links=$(grep -o '\[[^]]*\]([^)]*)' "$file" | \
          grep -o '([^)]*)' | \
          tr -d '()' | \
          grep -v '^http' | \
          grep -v '|' | \
          grep -v '\\' || true)

  if [ -z "$links" ]; then
    continue
  fi

  dir=$(dirname "$file")

  echo "$links" | while read -r link; do
    # Handle relative paths
    if [[ "$link" == /* ]]; then
      # Absolute path from repo root
      target=".$link"
    elif [[ "$link" == ../* ]]; then
      # Relative path with ../
      target="$dir/$link"
    else
      # Relative path
      target="$dir/$link"
    fi

    # Remove anchor fragments
    target_file="${target%#*}"

    # Check if file exists
    if [ ! -f "$target_file" ] && [ ! -d "$target_file" ]; then
      echo -e "${RED}ERROR: Broken link in $file: $link → $target_file${NC}"
      error_count=$((error_count + 1))
    fi
  done
done

# Check exit status
if [ $error_count -eq 0 ]; then
  echo -e "${GREEN}✅ All documentation links are valid${NC}"
  exit 0
else
  echo -e "${RED}❌ Found $error_count broken link(s)${NC}"
  exit 1
fi