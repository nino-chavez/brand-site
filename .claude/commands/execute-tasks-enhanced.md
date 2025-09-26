# Execute Enhanced Tasks

Guided implementation assistance with comprehensive context awareness and iterative validation

Refer to the instructions located in this file:
@.agent-os/instructions/core/execute-tasks-enhanced.md

## Prerequisites

- Must have approved tasks created with `/create-tasks` or `/create-tasks-enhanced`
- Requires existing spec directory with tasks.md in @.agent-os/specs/

## Key Features (Kiro-Inspired)

- **Comprehensive Context**: Reads ALL spec documents for complete implementation context
- **Implementation Strategy**: Explains approach and files to be modified before coding
- **Progress Tracking**: Real-time task completion marking and status updates
- **User Control Commands**:
  - `implement` - Start next uncompleted task
  - `implement [task number]` - Start specific task
  - `continue` - Resume from last incomplete task
  - `status` - Show current progress
- **Iterative Validation**: "Does the output match expectations?" approval per task
- **Quality Gates**: Ensures phase completion before proceeding

## Implementation Process

1. **Context Analysis**: Summarizes relationships between requirements, design, and tasks
2. **Task Planning**: Explains implementation approach and files to modify
3. **User Approval**: Validates approach before implementing
4. **Code Implementation**: Guided coding with real-time explanation
5. **Task Validation**: Confirms completion and satisfaction of acceptance criteria
6. **Progress Updates**: Real-time tracking and next steps

## Complete Enhanced Workflow

1. `/create-spec-enhanced` → Requirements with acceptance criteria
2. `/create-design` → Technical design with architecture
3. `/create-tasks-enhanced` → Actionable implementation tasks
4. **`/execute-tasks-enhanced`** → Guided implementation (THIS COMMAND)

## Available Commands During Execution

- **`implement`** - Start with next uncompleted task
- **`implement [number]`** - Jump to specific task (e.g., "implement 5")
- **`continue`** - Resume from where you left off
- **`status`** - Show detailed progress report

Use this command for comprehensive, guided implementation with quality validation at each step.