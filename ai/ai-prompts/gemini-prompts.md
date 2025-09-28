# Gemini Prompts for Practical Developer Documentation

> Use these prompts with Gemini to generate clear, direct, and practical documentation for developers.

## 🎯 Core Principle: Actionable Clarity

These prompts are designed to generate documentation that:
- Explains technical decisions and standards with precision.
- Provides immediate, practical value to developers.
- Includes actionable guidance and clear code examples.
- Focuses on creating reusable reference material, not narratives.

## 📝 Prompt Templates

### 1. `../../docs/TECHNICAL-DECISIONS.md`

```
Create a document explaining the core architectural choices for my [PROJECT_TYPE] built with [TECH_STACK].

The goal is to create a reference for developers to understand the system's design principles.

ARCHITECTURAL DECISIONS TO COVER:
- [TECH_STACK]-specific patterns: Explain the pattern and the principle it follows.
- Service layer abstractions: Describe the abstraction and its benefits for decoupling.
- State management approach: Explain the chosen strategy and the trade-offs considered against alternatives.
- Component organization: Describe the directory structure and component responsibility rules.
- Error handling strategy: Outline the patterns for error propagation and user feedback.

WRITING STYLE:
- Use a direct, analytical tone.
- For each decision, explain the "why" and the trade-offs.
- Include concise code snippets that demonstrate the pattern.
- Keep it accessible to an intermediate developer.
```

### 2. `AI-WORKFLOW.md`

```
Create a document named `AI-WORKFLOW.md` that describes the process and tools for AI-assisted development in this project.

The goal is to provide a practical guide for team members.

WORKFLOW AND TOOLS TO DOCUMENT:
- **Tool Roles**: Specify which AI tool (e.g., GitHub Copilot, Claude) is used for which task (e.g., boilerplate, refactoring, documentation).
- **Integration**: Describe how the different AI tools are integrated into the development workflow and IDE.
- **Validation**: Outline the process for reviewing and validating AI-generated code to ensure it meets quality standards.
- **Prompting Patterns**: Link to `../../docs/PROMPTING-STRATEGIES.md` for detailed techniques.

Focus on creating a clear, actionable workflow that any developer on the team can follow.
```

### 3. `../../docs/CODE-QUALITY.md`

```
Create a document outlining the code quality standards, static analysis configuration, and testing strategy for this [TECH_STACK] project.

The goal is to provide a clear specification that can be enforced automatically.

QUALITY STANDARDS TO DOCUMENT:
- **TypeScript Configuration**: Provide the `tsconfig.json` and explain the reasoning for key `compilerOptions` (e.g., `strict`, `noImplicitAny`).
- **Linting**: Provide the linter configuration file (e.g., `.eslintrc.json`) and explain the most important rules.
- **Formatting**: Specify the code formatter used (e.g., Prettier) and provide its configuration.
- **Testing Strategy**: Describe the different types of tests (unit, integration), the testing framework used, and where they are located. Include a clear example of a standard unit test.
- **Performance**: List any key performance optimization patterns that are enforced (e.g., memoization, virtualized lists).

Emphasize concrete configurations and clear rules.
```

### 4. `../../docs/PROMPTING-STRATEGIES.md`

```
Create a technical guide to the prompting patterns used for AI-assisted development in this project.

The goal is to create a reference that helps developers write effective prompts.

PROMPT PATTERNS TO DOCUMENT:
- **Component Generation**: A template for generating a new component with context.
- **Code Refactoring**: A template for refactoring a piece of code to meet a specific standard.
- **Architecture Analysis**: A prompt for asking the AI to analyze a code snippet for architectural violations.
- **Debugging**: A pattern for providing error messages and context to get debugging help.
- **Documentation Generation**: A prompt for generating documentation for a function or component.

For each pattern, provide:
- A clear prompt template.
- An explanation of its purpose.
- A list of common failure modes or pitfalls to avoid (e.g., missing context, vague instructions).

Make this a practical, actionable guide.
```

## 🎯 Output Guidelines

### ✅ DO:
- Keep documents concise and focused on a single topic.
- Include specific, practical code examples and configurations.
- Focus on actionable guidance developers can use immediately.
- Explain the underlying principle behind a standard or decision.
- Use a direct and technical tone.

### ❌ DON'T:
- Write long, narrative-style documents.
- Include business metrics, ROI, or marketing language.
- Create high-level showcases; focus on implementation details.
- Assume prior knowledge; explain concepts clearly.

## 🔄 Document Goals

- **Clarity**: A developer can understand the standard or process in under 15 minutes.
- **Actionability**: A developer can immediately apply the guidance to their work.
- **Reference Value**: The document is useful as a go-to reference for project standards.
- **Onboarding**: New team members can use these documents to quickly learn project-specific practices.
