#!/bin/bash
# Generate Component Relationship Mermaid Diagram
# Analyzes src/ directory to create architecture diagrams

set -e

echo "📊 Generating Component Relationship Diagram..."

# Output file
OUTPUT_FILE="${1:-.agent-os/generated/component-diagram.mmd}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Start Mermaid diagram
cat > "$OUTPUT_FILE" << 'HEADER'
```mermaid
graph TD
    subgraph "Application Root"
        A[App.tsx]
    end

HEADER

# Analyze contexts
echo "  Analyzing contexts..."
cat >> "$OUTPUT_FILE" << 'EOF'
    subgraph "Context Providers"
EOF

context_files=$(find src/contexts -name "*.tsx" -o -name "*.ts" 2>/dev/null | sort)
ctx_id=65  # Start at 'A' + 65 = ASCII

for ctx in $context_files; do
    basename=$(basename "$ctx" | sed 's/\.[^.]*$//')
    char=$(printf "\\$(printf '%03o' $ctx_id)")
    echo "        $char[$basename]" >> "$OUTPUT_FILE"
    ((ctx_id++))
done

cat >> "$OUTPUT_FILE" << 'EOF'
    end

EOF

# Analyze major component directories
echo "  Analyzing components..."
for dir in canvas layout ui sports gallery content effects; do
    if [ -d "src/components/$dir" ]; then
        dir_name=$(echo "$dir" | sed 's/^./\U&/')
        echo "    subgraph \"${dir_name} Components\"" >> "$OUTPUT_FILE"

        comp_files=$(find "src/components/$dir" -maxdepth 1 -name "*.tsx" 2>/dev/null | sort | head -6)
        for comp in $comp_files; do
            basename=$(basename "$comp" | sed 's/\.[^.]*$//')
            char=$(printf "\\$(printf '%03o' $ctx_id)")
            echo "        $char[$basename]" >> "$OUTPUT_FILE"
            ((ctx_id++))
        done

        echo "    end" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

# Add basic relationships
echo "  Adding relationships..."
cat >> "$OUTPUT_FILE" << 'EOF'
    A --> B
    A --> C
    A --> D

    B -.->|provides state| E
    C -.->|provides state| F
    D -.->|provides state| G

    classDef rootClass fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    classDef contextClass fill:#e1f5ff,stroke:#0066cc,stroke-width:2px
    classDef componentClass fill:#fff3e0,stroke:#ff9800,stroke-width:2px

    class A rootClass
    class B,C,D contextClass
EOF

# Close diagram
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "*Generated: $(date +%Y-%m-%d) from src/ component analysis*" >> "$OUTPUT_FILE"

echo "✅ Diagram generated: $OUTPUT_FILE"
echo ""
echo "Preview:"
head -20 "$OUTPUT_FILE"
echo "..."