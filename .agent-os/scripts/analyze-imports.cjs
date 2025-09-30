#!/usr/bin/env node
/**
 * Import Relationship Analyzer
 * Analyzes TypeScript/TSX files to generate component relationship diagrams
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = 'src';
const OUTPUT_DIR = '.agent-os/generated';
const MAX_DEPTH = 3; // Maximum import depth to analyze

// Component categories
const CATEGORIES = {
  contexts: 'Context Providers',
  components: 'Components',
  hooks: 'Custom Hooks',
  utils: 'Utilities',
  types: 'Type Definitions'
};

class ImportAnalyzer {
  constructor() {
    this.files = new Map();
    this.relationships = [];
    this.nodeId = 0;
  }

  /**
   * Scan directory recursively for TypeScript files
   */
  scanDirectory(dir, category = null) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Determine category from directory name
        const newCategory = CATEGORIES[entry.name] || category;
        this.scanDirectory(fullPath, newCategory);
      } else if (entry.name.match(/\.(tsx?|jsx?)$/)) {
        this.analyzeFile(fullPath, category);
      }
    }
  }

  /**
   * Analyze a single file for imports
   */
  analyzeFile(filePath, category) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const imports = this.extractImports(content);

      const relativePath = filePath.replace(`${SRC_DIR}/`, '');
      const fileName = path.basename(filePath, path.extname(filePath));

      this.files.set(relativePath, {
        id: this.nodeId++,
        name: fileName,
        path: relativePath,
        category: category || this.inferCategory(relativePath),
        imports: imports,
        isComponent: this.isComponent(content, fileName)
      });
    } catch (error) {
      console.error(`Error analyzing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Extract import statements from file content
   */
  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      // Only track local imports (relative paths or @/ alias)
      if (importPath.startsWith('.') || importPath.startsWith('@/')) {
        imports.push(importPath);
      }
    }

    return imports;
  }

  /**
   * Determine if file is a React component
   */
  isComponent(content, fileName) {
    // Check for React component patterns
    return (
      content.includes('export default') ||
      content.includes('export const') ||
      content.includes('export function')
    ) && (
      content.includes('React.FC') ||
      content.includes(': FC<') ||
      content.includes('return (') ||
      fileName.match(/^[A-Z]/) // Starts with capital letter
    );
  }

  /**
   * Infer category from file path
   */
  inferCategory(filePath) {
    if (filePath.includes('contexts/')) return 'Context Providers';
    if (filePath.includes('components/')) return 'Components';
    if (filePath.includes('hooks/')) return 'Custom Hooks';
    if (filePath.includes('utils/')) return 'Utilities';
    if (filePath.includes('types/')) return 'Type Definitions';
    return 'Other';
  }

  /**
   * Build relationship graph
   */
  buildRelationships() {
    for (const [filePath, fileData] of this.files.entries()) {
      for (const importPath of fileData.imports) {
        const resolvedPath = this.resolveImportPath(filePath, importPath);
        const importedFile = this.files.get(resolvedPath);

        if (importedFile) {
          this.relationships.push({
            from: fileData.id,
            to: importedFile.id,
            fromName: fileData.name,
            toName: importedFile.name
          });
        }
      }
    }
  }

  /**
   * Resolve import path to actual file path
   */
  resolveImportPath(fromPath, importPath) {
    // Handle @/ alias
    if (importPath.startsWith('@/')) {
      importPath = importPath.replace('@/', '');
    }
    // Handle relative imports
    else if (importPath.startsWith('.')) {
      const dir = path.dirname(fromPath);
      importPath = path.join(dir, importPath);
    }

    // Normalize path
    importPath = path.normalize(importPath);

    // Try different extensions
    for (const ext of ['.tsx', '.ts', '.jsx', '.js', '']) {
      const candidate = importPath + ext;
      if (this.files.has(candidate)) {
        return candidate;
      }
      // Try index file
      const indexCandidate = path.join(importPath, 'index' + ext);
      if (this.files.has(indexCandidate)) {
        return indexCandidate;
      }
    }

    return null;
  }

  /**
   * Generate Mermaid diagram
   */
  generateMermaidDiagram() {
    let diagram = '```mermaid\ngraph TD\n';

    // Group by category
    const categories = new Map();
    for (const [filePath, fileData] of this.files.entries()) {
      if (!categories.has(fileData.category)) {
        categories.set(fileData.category, []);
      }
      categories.get(fileData.category).push(fileData);
    }

    // Generate subgraphs for each category
    for (const [category, files] of categories.entries()) {
      // Only include categories with components
      const components = files.filter(f => f.isComponent);
      if (components.length === 0) continue;

      diagram += `    subgraph "${category}"\n`;

      // Limit to top 10 most connected components per category
      const sortedComponents = components
        .map(comp => ({
          ...comp,
          connections: this.relationships.filter(
            r => r.from === comp.id || r.to === comp.id
          ).length
        }))
        .sort((a, b) => b.connections - a.connections)
        .slice(0, 10);

      for (const file of sortedComponents) {
        const nodeId = String.fromCharCode(65 + file.id); // A, B, C, ...
        diagram += `        ${nodeId}[${file.name}]\n`;
      }

      diagram += '    end\n\n';
    }

    // Add relationships (limit to most important ones)
    const importantRelationships = this.relationships
      .filter(rel => {
        const from = Array.from(this.files.values()).find(f => f.id === rel.from);
        const to = Array.from(this.files.values()).find(f => f.id === rel.to);
        return from && to && from.isComponent && to.isComponent;
      })
      .slice(0, 30); // Limit to 30 relationships to keep diagram readable

    for (const rel of importantRelationships) {
      const fromNode = String.fromCharCode(65 + rel.from);
      const toNode = String.fromCharCode(65 + rel.to);
      diagram += `    ${fromNode} --> ${toNode}\n`;
    }

    // Add styling
    diagram += `
    classDef contextClass fill:#e1f5ff,stroke:#0066cc,stroke-width:2px
    classDef componentClass fill:#fff4e0,stroke:#ff9800,stroke-width:2px
    classDef hookClass fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
`;

    diagram += '```\n\n';
    diagram += `*Generated: ${new Date().toISOString().split('T')[0]} from import analysis*\n`;

    return diagram;
  }

  /**
   * Generate statistics report
   */
  generateStats() {
    const stats = {
      totalFiles: this.files.size,
      totalComponents: Array.from(this.files.values()).filter(f => f.isComponent).length,
      totalRelationships: this.relationships.length,
      byCategory: {}
    };

    for (const [filePath, fileData] of this.files.entries()) {
      if (!stats.byCategory[fileData.category]) {
        stats.byCategory[fileData.category] = 0;
      }
      stats.byCategory[fileData.category]++;
    }

    return stats;
  }
}

// Main execution
function main() {
  console.log('📊 Analyzing import relationships...\n');

  const analyzer = new ImportAnalyzer();

  // Scan src directory
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Error: ${SRC_DIR} directory not found`);
    process.exit(1);
  }

  analyzer.scanDirectory(SRC_DIR);
  analyzer.buildRelationships();

  // Generate outputs
  const diagram = analyzer.generateMermaidDiagram();
  const stats = analyzer.generateStats();

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write diagram
  const diagramFile = path.join(OUTPUT_DIR, 'import-diagram.mmd');
  fs.writeFileSync(diagramFile, diagram);
  console.log(`✅ Diagram generated: ${diagramFile}`);

  // Write stats
  const statsFile = path.join(OUTPUT_DIR, 'codebase-stats.json');
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  console.log(`✅ Statistics saved: ${statsFile}`);

  // Print summary
  console.log('\n📈 Codebase Statistics:');
  console.log(`   Total files analyzed: ${stats.totalFiles}`);
  console.log(`   Total components: ${stats.totalComponents}`);
  console.log(`   Total relationships: ${stats.totalRelationships}`);
  console.log('\n   By category:');
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`   - ${category}: ${count}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ImportAnalyzer };