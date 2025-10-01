#!/usr/bin/env tsx
/**
 * Auto-Generate Storybook Stories
 *
 * Analyzes TypeScript component files and automatically generates
 * comprehensive Storybook stories based on their props interfaces.
 *
 * Usage:
 *   npm run stories:generate              # Generate all missing stories
 *   npm run stories:generate Button       # Generate for specific component
 *   npm run stories:generate --force      # Regenerate all stories
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as ts from 'typescript';

interface ComponentInfo {
  name: string;
  filePath: string;
  propsInterface?: string;
  props: PropInfo[];
  category: string;
}

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

const COMPONENT_CATEGORIES = {
  'layout': 'Layout',
  'canvas': 'Canvas',
  'gallery': 'Gallery',
  'ui': 'UI',
  'sports': 'Sports',
  'effects': 'Effects',
  'content': 'Content',
};

const IGNORE_COMPONENTS = [
  'index.ts',
  'index.tsx',
  '.test.',
  '.spec.',
];

/**
 * Scans component directory for TypeScript components
 */
async function findComponents(dir: string): Promise<ComponentInfo[]> {
  const components: ComponentInfo[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const subComponents = await findComponents(fullPath);
      components.push(...subComponents);
    } else if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.stories.tsx')) {
      // Skip ignored files
      if (IGNORE_COMPONENTS.some(ignore => entry.name.includes(ignore))) {
        continue;
      }

      // Extract component info
      const componentInfo = await analyzeComponent(fullPath);
      if (componentInfo) {
        components.push(componentInfo);
      }
    }
  }

  return components;
}

/**
 * Analyzes a component file to extract props and metadata
 */
async function analyzeComponent(filePath: string): Promise<ComponentInfo | null> {
  const content = await fs.readFile(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.tsx');

  // Determine category from directory structure
  const relativePath = path.relative(path.join(process.cwd(), 'src/components'), filePath);
  const category = relativePath.split(path.sep)[0];
  const categoryName = COMPONENT_CATEGORIES[category as keyof typeof COMPONENT_CATEGORIES] || 'Other';

  // Parse TypeScript to extract props
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const props: PropInfo[] = [];
  let propsInterface: string | undefined;

  // Find props interface
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name.text;

      // Look for ComponentNameProps or Props interface
      if (interfaceName === `${fileName}Props` || interfaceName === 'Props') {
        propsInterface = interfaceName;

        // Extract props from interface
        node.members.forEach((member) => {
          if (ts.isPropertySignature(member) && member.name) {
            const propName = member.name.getText(sourceFile);
            const propType = member.type?.getText(sourceFile) || 'any';
            const required = !member.questionToken;

            // Extract JSDoc comment if available
            const jsDocTags = ts.getJSDocTags(member);
            const description = jsDocTags
              .find(tag => tag.tagName.text === 'description')
              ?.comment?.toString();

            props.push({
              name: propName,
              type: propType,
              required,
              description,
            });
          }
        });
      }
    }
  });

  // Skip if no props found
  if (props.length === 0) {
    return null;
  }

  return {
    name: fileName,
    filePath,
    propsInterface,
    props,
    category: categoryName,
  };
}

/**
 * Generates Storybook story content for a component
 */
function generateStoryContent(component: ComponentInfo): string {
  const { name, category, props } = component;

  // Generate imports
  const imports = `import type { Meta, StoryObj } from '@storybook/react';
import ${name} from './${name}';`;

  // Generate argTypes based on props
  const argTypes = props.map(prop => {
    const control = inferControl(prop.type);
    const lines = [
      `    ${prop.name}: {`,
    ];

    if (control) {
      lines.push(`      ${control},`);
    }

    if (prop.description) {
      lines.push(`      description: '${prop.description}',`);
    }

    lines.push(`    },`);
    return lines.join('\n');
  }).join('\n');

  // Generate default args based on props
  const defaultArgs = props
    .filter(prop => prop.required)
    .map(prop => {
      const defaultValue = inferDefaultValue(prop.type, prop.name);
      return `    ${prop.name}: ${defaultValue},`;
    })
    .join('\n');

  // Generate story variants based on prop types
  const variants = generateStoryVariants(props);

  return `${imports}

const meta = {
  title: '${category}/${name}',
  component: ${name},
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'landmark-unique', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
${argTypes}
  },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
${defaultArgs}
  },
};

${variants}`;
}

/**
 * Infers Storybook control type from TypeScript type
 */
function inferControl(type: string): string | null {
  // Boolean
  if (type === 'boolean') {
    return `control: 'boolean'`;
  }

  // String with specific values (union)
  if (type.includes('|') && type.includes("'")) {
    const values = type
      .split('|')
      .map(v => v.trim())
      .filter(v => v.startsWith("'"))
      .map(v => v.replace(/'/g, ''));
    return `control: 'select',\n      options: [${values.map(v => `'${v}'`).join(', ')}]`;
  }

  // Number
  if (type === 'number') {
    return `control: { type: 'number' }`;
  }

  // String
  if (type === 'string') {
    return `control: 'text'`;
  }

  // Function
  if (type.includes('=>') || type.includes('()')) {
    return null; // Functions don't need controls
  }

  return null;
}

/**
 * Infers default value from TypeScript type
 */
function inferDefaultValue(type: string, propName: string): string {
  // Boolean
  if (type === 'boolean') {
    return propName.startsWith('is') || propName.startsWith('has') || propName.startsWith('show')
      ? 'true'
      : 'false';
  }

  // String with union
  if (type.includes('|') && type.includes("'")) {
    const firstValue = type.split('|')[0].trim().replace(/'/g, '');
    return `'${firstValue}'`;
  }

  // Number
  if (type === 'number') {
    return '0';
  }

  // String
  if (type === 'string') {
    return `'${propName}'`;
  }

  // Function
  if (type.includes('=>')) {
    return '() => console.log(\'' + propName + '\')';
  }

  // Array
  if (type.includes('[]')) {
    return '[]';
  }

  // Object/undefined
  return 'undefined';
}

/**
 * Generates story variants based on prop types
 */
function generateStoryVariants(props: PropInfo[]): string {
  const variants: string[] = [];

  // Find boolean props for variants
  const booleanProps = props.filter(p => p.type === 'boolean');
  booleanProps.forEach(prop => {
    const variantName = prop.name
      .replace(/^(is|has|show)/, '')
      .replace(/^./, c => c.toUpperCase());

    variants.push(`
export const ${variantName}: Story = {
  args: {
    ${prop.name}: true,
  },
};`);
  });

  // Find union type props for variants
  const unionProps = props.filter(p => p.type.includes('|') && p.type.includes("'"));
  unionProps.forEach(prop => {
    const values = prop.type
      .split('|')
      .map(v => v.trim())
      .filter(v => v.startsWith("'"))
      .map(v => v.replace(/'/g, ''));

    values.forEach(value => {
      const variantName = value
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

      variants.push(`
export const ${variantName}: Story = {
  args: {
    ${prop.name}: '${value}',
  },
};`);
    });
  });

  return variants.join('\n');
}

/**
 * Writes story file if it doesn't exist or if --force flag is used
 */
async function writeStory(component: ComponentInfo, force: boolean = false): Promise<void> {
  const storyPath = component.filePath.replace('.tsx', '.stories.tsx');

  // Check if story already exists
  try {
    await fs.access(storyPath);
    if (!force) {
      console.log(`⏭️  ${component.category}/${component.name} - story already exists (use --force to regenerate)`);
      return;
    }
  } catch {
    // File doesn't exist, proceed
  }

  const content = generateStoryContent(component);
  await fs.writeFile(storyPath, content, 'utf-8');

  console.log(`✅ ${component.category}/${component.name} - story generated`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const componentFilter = args.find(arg => !arg.startsWith('--'));

  console.log('🔍 Scanning for components...\n');

  const componentsDir = path.join(process.cwd(), 'src/components');
  const components = await findComponents(componentsDir);

  console.log(`📦 Found ${components.length} components with props\n`);

  // Filter components if specified
  const filteredComponents = componentFilter
    ? components.filter(c => c.name.toLowerCase().includes(componentFilter.toLowerCase()))
    : components;

  if (filteredComponents.length === 0) {
    console.log('❌ No components found matching filter:', componentFilter);
    return;
  }

  console.log('🎨 Generating stories...\n');

  for (const component of filteredComponents) {
    await writeStory(component, force);
  }

  console.log(`\n✨ Story generation complete!`);
  console.log(`📄 Generated ${filteredComponents.length} stories\n`);
}

main().catch(console.error);
