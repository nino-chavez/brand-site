# AI-Assisted Development Workflow

This document describes the process and tools for AI-assisted development in this project. The goal is to provide a practical guide for team members.

## Tool Roles

This project utilizes a multi-agent AI team, with each agent assigned to specific tasks to maximize efficiency and leverage their unique strengths.

-   **Gemini**: Used for complex reasoning, code generation, and architectural analysis. Gemini is the primary agent for implementing new features and refactoring existing code.
-   **Claude**: Used for documentation, and generating human-readable explanations of code and technical decisions.
-   **GitHub Copilot**: Integrated into the IDE for real-time code completion and boilerplate generation.

## Integration

The AI tools are integrated into the development workflow in the following ways:

-   **IDE Integration**: GitHub Copilot is used directly within the IDE for immediate assistance with code implementation.
-   **CLI Agent**: Gemini and Claude are accessed through a command-line interface (CLI) agent, which allows for more complex interactions, such as running tests, reading files, and performing multi-step tasks.
-   **Prompt Library**: A library of pre-defined prompts is maintained in the `ai/ai-prompts` directory. These prompts are used to ensure consistency and quality in AI-generated code and documentation.

## Validation

All AI-generated code is subject to the same rigorous validation process as human-written code.

-   **Code Review**: All AI-generated code is reviewed by a human developer before being committed to the codebase.
-   **Testing**: AI-generated code must be accompanied by corresponding tests, and all tests must pass before the code is merged.
-   **Linting and Formatting**: All code, regardless of its origin, is automatically linted and formatted to ensure it adheres to the project's coding standards.

## Prompting Patterns

Effective prompting is key to successful AI-assisted development. A detailed guide to the prompting patterns used in this project can be found in [PROMPTING-STRATEGIES.md](./PROMPTING-STRATEGIES.md).
