# Create Design

Transform approved requirements into comprehensive technical design with architecture diagrams and implementation strategy

Refer to the instructions located in this file:
@.agent-os/instructions/core/create-design.md

## Prerequisites

- Must have approved spec created with `/create-spec` or `/create-spec-enhanced`
- Requires existing spec directory in @.agent-os/specs/

## Design Components

- **Architecture Overview**: System architecture with Mermaid.js diagrams
- **Component Interfaces**: TypeScript interfaces and API contracts
- **Data Models**: Database schema and entity relationships
- **Error Handling**: Comprehensive error classification and strategies
- **Testing Strategy**: Complete testing pyramid and coverage plan

## Workflow Position

1. `/create-spec-enhanced` → Create requirements with acceptance criteria
2. **`/create-design`** → Create technical design (THIS COMMAND)
3. `/create-tasks` → Generate implementation tasks from design

Use this command after requirements are approved to create a comprehensive technical blueprint before implementation.