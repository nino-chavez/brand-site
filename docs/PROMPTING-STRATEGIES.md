# Prompting Strategies for AI-Assisted Development

This document provides a technical guide to the prompting patterns used for AI-assisted development in this project. The goal is to create a reference that helps developers write effective prompts.

## Component Generation

When generating a new component, it's important to provide the AI with as much context as possible. This includes the component's name, its props, and any related components or types.

**Prompt Template:**

```
Create a new React component named `[ComponentName]`.

Props:
- `[propName]`: `[propType]` - [description]

Requirements:
- The component should be a functional component.
- It should be styled with Tailwind CSS.
- It should be fully typed with TypeScript.

Related files:
- `[RelatedComponent.tsx]`
- `[types.ts]`
```

**Failure Modes:**

-   **Missing Context**: If you don't provide enough context, the AI may generate a component that doesn't fit into the existing architecture.
-   **Vague Instructions**: If your instructions are too vague, the AI may generate a component that doesn't meet your requirements.

## Code Refactoring

When refactoring code, it's important to clearly state the desired outcome and provide the AI with the code to be refactored.

**Prompt Template:**

```
Refactor the following code to [desired outcome].

Code to refactor:

```typescript
[code snippet]
```

Requirements:
- The refactored code should follow the project's coding standards.
- It should be more performant.
- It should be more readable.
```

**Failure Modes:**

-   **Unclear Goal**: If you don't clearly state the desired outcome, the AI may make changes that you don't want.
-   **Incomplete Code Snippet**: If you only provide a partial code snippet, the AI may not have enough context to perform the refactoring correctly.

## Architecture Analysis

You can use the AI to analyze a code snippet for architectural violations.

**Prompt Template:**

```
Analyze the following code for architectural violations.

Code to analyze:

```typescript
[code snippet]
```

Architectural principles to check for:
- [principle 1]
- [principle 2]
- [principle 3]
```

**Failure Modes:**

-   **Missing Principles**: If you don't specify the architectural principles to check for, the AI may not be able to provide a useful analysis.

## Debugging

The AI can be a powerful debugging tool. To get the most out of it, you need to provide it with the error message, the relevant code, and any other context that might be helpful.

**Prompt Template:**

```
I'm getting the following error:

```
[error message]
```

Here is the code that's causing the error:

```typescript
[code snippet]
```

What could be the problem?
```

**Failure Modes:**

-   **Incomplete Error Message**: If you only provide a partial error message, the AI may not be able to identify the root cause of the problem.
-   **Missing Context**: If you don't provide enough context, the AI may not be able to understand how the code is being used.

## Documentation Generation

The AI can be used to generate documentation for a function or component.

**Prompt Template:**

```
Generate documentation for the following function.

```typescript
[function signature]
```

The documentation should include:
- A brief description of what the function does.
- A description of each parameter.
- A description of the return value.
- An example of how to use the function.
```

**Failure Modes:**

-   **Missing Signature**: If you don't provide the function signature, the AI won't be able to generate accurate documentation.