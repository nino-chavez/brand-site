# Create-Task Instructions

## Purpose
Break down technical specifications into actionable development tasks with clear acceptance criteria and implementation guidance.

## Usage
```bash
# Command format
create-task <spec-file> <task-scope> [priority]

# Example
create-task agent-ready-architecture.spec.md core high
```

## Task Creation Framework

### 1. **Task Identification**
Analyze the specification to identify discrete, actionable tasks:

#### 1.1 **Task Categories**
- **Architecture**: Foundational structure and patterns
- **Component**: Individual component implementation
- **Integration**: System integration and coordination
- **Documentation**: User and developer documentation
- **Testing**: Quality assurance and validation
- **Performance**: Optimization and benchmarking

#### 1.2 **Task Sizing**
- **Small (S)**: 2-4 hours, single developer
- **Medium (M)**: 4-8 hours, may need coordination
- **Large (L)**: 1-2 days, complex implementation
- **Extra Large (XL)**: 2+ days, needs breakdown

### 2. **Task Template**

#### Task Header
```markdown
## Task: [TASK_ID] - [Task Name]
**Category**: [Architecture/Component/Integration/Documentation/Testing/Performance]
**Size**: [S/M/L/XL]
**Priority**: [High/Medium/Low]
**Dependencies**: [List of prerequisite tasks]
**Assignable to**: [Human/AI Agent/Collaborative]
```

#### Task Body
```markdown
### Description
[Clear, actionable description of what needs to be implemented]

### Acceptance Criteria
- [ ] **Functional**: [Specific functional requirements]
- [ ] **Technical**: [Technical implementation requirements]
- [ ] **Quality**: [Code quality and testing requirements]
- [ ] **Agent-Ready**: [Machine interface requirements]

### Implementation Guide

#### Step 1: [Phase Name]
- **Action**: [Specific action to take]
- **Expected Output**: [What should be produced]
- **Validation**: [How to verify completion]

#### Step 2: [Phase Name]
[Continue with additional steps]

### Files to Modify/Create
- `path/to/file.tsx` - [Description of changes]
- `path/to/test.spec.ts` - [Test requirements]

### Testing Requirements
- **Unit Tests**: [Specific test cases]
- **Integration Tests**: [Integration scenarios]
- **Agent Tests**: [Machine interface validation]

### Documentation Requirements
- **Code Comments**: [What needs documentation]
- **User Docs**: [User-facing documentation needs]
- **Developer Docs**: [Technical documentation needs]

### Definition of Done
- [ ] Code implemented and reviewed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Agent interface validated
- [ ] Performance benchmarked
- [ ] Integration verified
```

### 3. **Agent-Ready Task Specifications**

#### 3.1 **Human Interface Tasks**
Focus on traditional UI/UX implementation:
- React component development
- State management integration
- User interaction handling
- Responsive design implementation

#### 3.2 **Machine Interface Tasks**
Focus on agent accessibility:
- Schema.org structured data implementation
- Agent action registry entries
- Natural language interface development
- Agent state exposure patterns

#### 3.3 **Dual-Interface Tasks**
Focus on coordination between interfaces:
- Unified state management
- Cross-interface testing
- Performance optimization
- Integration validation

### 4. **Task Dependencies**

#### 4.1 **Sequential Dependencies**
Tasks that must be completed in order:
```markdown
Task A → Task B → Task C
```

#### 4.2 **Parallel Dependencies**
Tasks that can be worked on simultaneously:
```markdown
Task A ┐
       ├→ Task C
Task B ┘
```

#### 4.3 **Optional Dependencies**
Tasks that enhance but don't block:
```markdown
Task A → Task B (required)
      ↳ Task C (optional enhancement)
```

### 5. **Task Assignment Strategy**

#### 5.1 **Human-Only Tasks**
- Complex architectural decisions
- Creative UI/UX design
- User experience validation
- Strategic technical decisions

#### 5.2 **AI-Friendly Tasks**
- Boilerplate code generation
- Test case implementation
- Documentation writing
- Schema definition creation

#### 5.3 **Collaborative Tasks**
- Component implementation (AI generates, human reviews)
- Documentation creation (AI drafts, human refines)
- Test development (AI creates cases, human validates)

### 6. **Quality Gates**

Each task must pass through these gates:

#### 6.1 **Functional Gate**
- [ ] Feature works as specified
- [ ] User requirements satisfied
- [ ] Error handling implemented

#### 6.2 **Technical Gate**
- [ ] Code follows standards
- [ ] TypeScript types are correct
- [ ] Performance requirements met

#### 6.3 **Agent-Ready Gate**
- [ ] Schema.org data is valid
- [ ] Agent actions are registered
- [ ] Machine interface is testable

#### 6.4 **Integration Gate**
- [ ] Works with existing codebase
- [ ] Documentation is updated
- [ ] Tests pass in CI/CD

### 7. **Task Tracking**

#### 7.1 **Status Values**
- **Not Started**: Task identified but not begun
- **In Progress**: Currently being worked on
- **Review**: Awaiting review or validation
- **Testing**: In QA or testing phase
- **Done**: Completed and integrated

#### 7.2 **Progress Indicators**
```markdown
### Task Progress: [TASK_ID]
- **Status**: [Current status]
- **Completion**: [Percentage complete]
- **Blockers**: [Any current blockers]
- **Next Steps**: [Immediate next actions]
```

### 8. **Task Validation**

Before marking a task complete:

#### 8.1 **Code Review Checklist**
- [ ] Code follows TypeScript standards
- [ ] React patterns are correctly implemented
- [ ] Error handling is comprehensive
- [ ] Performance impact is acceptable

#### 8.2 **Agent Interface Checklist**
- [ ] Structured data validates against schema
- [ ] Agent actions are properly registered
- [ ] Natural language parsing works correctly
- [ ] Cross-browser agent compatibility verified

#### 8.3 **Documentation Checklist**
- [ ] User-facing documentation is updated
- [ ] Developer documentation reflects changes
- [ ] API documentation includes agent interfaces
- [ ] Examples are provided and tested

## Example Task Breakdown

Given a spec for "Agent-Ready Photo Gallery", create tasks like:

1. **ARCH-001**: Setup agent-ready component architecture (M, High)
2. **COMP-001**: Implement PhotoGallery human interface (L, High)
3. **COMP-002**: Add Schema.org structured data (M, High)
4. **COMP-003**: Implement agent action registry (M, Medium)
5. **INTG-001**: Integrate with existing state management (S, High)
6. **TEST-001**: Create dual-interface test suite (M, Medium)
7. **DOCS-001**: Update documentation with agent patterns (S, Low)

Each task includes complete implementation guidance, acceptance criteria, and validation steps.