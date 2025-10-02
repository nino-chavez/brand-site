# Story Automation System

## Overview

Automated system for generating, validating, and maintaining Storybook stories in sync with your React components.

## Features

- 🤖 **Auto-Generation**: Automatically creates stories from component TypeScript interfaces
- 🔍 **Validation**: Ensures all components have stories and stories are up-to-date
- 👀 **File Watching**: Monitors components and auto-generates stories for new components
- 🎯 **Intelligent Inference**: Detects prop types and generates appropriate story variants

## Commands

```bash
# Generate stories for all components
npm run stories:generate

# Generate stories for specific component
npm run stories:generate Button

# Force regenerate all stories (overwrites existing)
npm run stories:generate:force

# Validate all stories
npm run stories:validate

# Watch for component changes and auto-generate
npm run stories:watch
```

## How It Works

### 1. Auto-Generation (`npm run stories:generate`)

The script analyzes your TypeScript components:

1. **Scans** `src/components/` for `.tsx` files
2. **Parses** TypeScript AST to extract props interfaces
3. **Infers** control types from prop types (boolean → toggle, union → select, etc.)
4. **Generates** story file with:
   - Imports
   - Meta configuration
   - ArgTypes from props
   - Default story
   - Variants for boolean and union props

**Example:**

Component with props:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}
```

Generates story with:
- `Default` variant
- `Primary` variant (variant='primary')
- `Secondary` variant (variant='secondary')
- `Disabled` variant (disabled=true)

### 2. Validation (`npm run stories:validate`)

Validates that:
- ✅ All components have corresponding stories
- ✅ Stories import components correctly
- ✅ Stories have `Default` variant
- ✅ Stories have `autodocs` tag
- ✅ Stories have accessibility config
- ✅ Stories have argTypes definition

**Example output:**
```
⚠️  Button
   • Missing argTypes definition

❌ NewComponent
   • Missing story file

✅ All other stories valid
```

### 3. File Watching (`npm run stories:watch`)

Monitors `src/components/` and:
- Detects new `.tsx` component files
- Automatically generates stories for them
- Debounces changes (1 second)
- Logs generation status

**Perfect for development:**
```bash
# Terminal 1: Watch for changes
npm run stories:watch

# Terminal 2: Storybook
npm run storybook

# Terminal 3: Your editor
# Create new component → story auto-generates!
```

## Generated Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import ComponentName from './ComponentName';

const meta = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
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
    // Auto-generated from props
    propName: {
      control: 'select',
      options: ['value1', 'value2'],
      description: 'Prop description from JSDoc',
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Auto-inferred defaults
  },
};

// Auto-generated variants
export const VariantName: Story = {
  args: {
    propName: 'specificValue',
  },
};
```

## Customizing Generated Stories

### Adding JSDoc Descriptions

Add descriptions to your component props:

```typescript
interface MyComponentProps {
  /**
   * @description The visual style variant
   */
  variant: 'primary' | 'secondary';
}
```

The description will automatically appear in the generated story's argTypes.

### Controlling Story Categories

Stories are automatically categorized by directory:

```
src/components/
  layout/     → 'Layout/ComponentName'
  canvas/     → 'Canvas/ComponentName'
  gallery/    → 'Gallery/ComponentName'
  ui/         → 'UI/ComponentName'
  sports/     → 'Sports/ComponentName'
  effects/    → 'Effects/ComponentName'
  content/    → 'Content/ComponentName'
```

### Handling Complex Props

The generator intelligently handles:

**Boolean props:**
```typescript
isActive: boolean;
// Generates: control: 'boolean'
// Variant: Active (isActive=true)
```

**Union types:**
```typescript
size: 'small' | 'medium' | 'large';
// Generates: control: 'select', options: ['small', 'medium', 'large']
// Variants: Small, Medium, Large
```

**Numbers:**
```typescript
count: number;
// Generates: control: { type: 'number' }
```

**Functions:**
```typescript
onClick: () => void;
// Generates: () => console.log('onClick')
```

## Integration with Screenshot Framework

Auto-generated stories work seamlessly with the screenshot capture framework:

```bash
# 1. Generate stories
npm run stories:generate

# 2. Validate
npm run stories:validate

# 3. Capture screenshots
npm run capture:all
```

The screenshot framework will automatically discover and capture all generated stories.

## Best Practices

### 1. Use TypeScript Interfaces

Always define props with interfaces:

```typescript
// ✅ Good
interface ComponentProps {
  variant: 'primary' | 'secondary';
}

// ❌ Won't auto-generate
const Component = ({ variant }) => { ... }
```

### 2. Add JSDoc Comments

Provide descriptions for better documentation:

```typescript
interface ComponentProps {
  /**
   * @description Visual variant of the component
   */
  variant: 'primary' | 'secondary';

  /**
   * @description Callback when component is clicked
   */
  onClick: () => void;
}
```

### 3. Use Descriptive Prop Names

The generator creates variant names from prop names:

```typescript
// ✅ Good - generates "Loading" variant
isLoading: boolean;

// ✅ Good - generates "Primary" variant
variant: 'primary' | 'secondary';

// ❌ Less descriptive
flag: boolean;
mode: 'a' | 'b';
```

### 4. Validate Regularly

Run validation before committing:

```bash
npm run stories:validate
```

Or add to your CI:

```yaml
- name: Validate stories
  run: npm run stories:validate
```

## Troubleshooting

### "No components found with props"

**Cause**: Components don't have TypeScript props interfaces

**Solution**: Add props interface:
```typescript
interface MyComponentProps {
  // your props
}

const MyComponent: React.FC<MyComponentProps> = (props) => { ... }
```

### "Story already exists"

**Cause**: Story file already present

**Solution**: Use `--force` to regenerate:
```bash
npm run stories:generate:force
```

### "Missing Default story variant"

**Cause**: Manually created story missing Default export

**Solution**: Add Default variant:
```typescript
export const Default: Story = {
  args: { ... },
};
```

## Workflow Examples

### Adding a New Component

```bash
# Terminal 1: Start watcher
npm run stories:watch

# Terminal 2: Create component
cat > src/components/ui/NewButton.tsx << 'EOF'
interface NewButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

const NewButton: React.FC<NewButtonProps> = ({ variant, onClick }) => {
  return <button onClick={onClick}>{variant}</button>;
};

export default NewButton;
EOF

# Watcher auto-generates story!
# Output: ✅ UI/NewButton - Story generated successfully
```

### Updating Existing Component

```bash
# 1. Update component props
# 2. Regenerate story
npm run stories:generate:force NewButton

# 3. Validate
npm run stories:validate

# 4. Capture new screenshots
npm run capture:components -- --grep "NewButton"
```

### Pre-Commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Validate all stories
npm run stories:validate

if [ $? -ne 0 ]; then
  echo "❌ Story validation failed. Fix issues before committing."
  exit 1
fi

echo "✅ All stories valid"
```

## Advanced: Customizing Generation

### Modify Generator Script

Edit `scripts/generate-stories.ts` to customize:

**Change default layout:**
```typescript
parameters: {
  layout: 'centered', // instead of 'fullscreen'
```

**Add custom decorators:**
```typescript
decorators: [
  (Story) => (
    <YourProvider>
      <Story />
    </YourProvider>
  ),
],
```

**Change naming convention:**
```typescript
title: `${category}/${name}`, // customize format
```

## Statistics

After running `npm run stories:generate`:

```
📦 Found 50 components with props
✨ Story generation complete!
📄 Generated 48 stories (2 already existed)

Categories:
  • Layout: 15 stories
  • Canvas: 4 stories
  • Gallery: 6 stories
  • UI: 10 stories
  • Sports: 15 stories
  • Effects: 3 stories
  • Content: 5 stories
```

## Related Documentation

- **Screenshot Framework**: `docs/SCREENSHOT_FRAMEWORK.md`
- **Quick Start**: `docs/SCREENSHOT_QUICKSTART.md`
- **Architecture**: `ai/ai-prompts/claude/screenshot-framework-architecture.md`
