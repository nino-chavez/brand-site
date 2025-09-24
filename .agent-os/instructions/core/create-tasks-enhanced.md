---
description: Enhanced Task Creation Rules for Agent OS (Kiro-inspired task breakdown)
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Enhanced Task Creation Rules

## Overview

Break down approved requirements and design into actionable coding steps with incremental building, early testing, and clear requirement traceability.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="context-fetcher" name="spec_and_design_validation">

### Step 1: Spec and Design Validation

Use the context-fetcher subagent to locate and validate that both approved spec and design exist for this feature.

<validation_process>
  1. CHECK for existing spec directory in @.agent-os/specs/
  2. READ spec.md to understand requirements and acceptance criteria
  3. CHECK for design.md to understand technical architecture
  4. VERIFY both spec and design have been approved
  5. EXTRACT key requirements, acceptance criteria, and design components
</validation_process>

<decision_tree>
  IF no_approved_spec_found:
    ERROR: "Please run /ao:create-spec-enhanced first to create approved requirements"
    HALT process
  IF no_design_found:
    WARN: "No design.md found. Consider running /ao:create-design for better task breakdown"
    CONTINUE with basic task creation
  ELSE:
    CONTINUE to enhanced task creation
</decision_tree>

</step>

<step number="2" subagent="context-fetcher" name="technical_context">

### Step 2: Technical Context Analysis

Use the context-fetcher subagent to analyze the technical context for task planning.

<context_analysis>
  <existing_codebase>identify existing components that need modification</existing_codebase>
  <technology_stack>extract technologies from tech-stack.md</technology_stack>
  <dependencies>identify external dependencies and integrations</dependencies>
  <testing_framework>determine testing approach from codebase</testing_framework>
</context_analysis>

<task_planning_inputs>
  - Requirements with acceptance criteria
  - Technical design (if available)
  - Existing codebase structure
  - Technology constraints
  - Testing requirements
</task_planning_inputs>

</step>

<step number="3" subagent="file-creator" name="create_enhanced_tasks">

### Step 3: Create Enhanced Tasks Document

Use the file-creator subagent to create the file: tasks.md with Kiro-inspired task breakdown methodology.

<file_template>
  <header>
    # Implementation Tasks

    **Spec:** @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
    **Design:** @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/design.md
    **Created:** [CURRENT_DATE]

    ## Task Completion Strategy

    - **Incremental Building:** Each task builds upon previous completed work
    - **Early Testing:** Testing tasks are prioritized to catch issues early
    - **No Orphaned Code:** Every code change contributes to working functionality
    - **Requirement Traceability:** Each task references specific requirements or acceptance criteria
  </header>
  <task_structure>
    - Max two-level hierarchy (Main Task -> Sub-tasks)
    - Checkbox format for progress tracking
    - Clear scope and requirement references
    - Coding-focused tasks (write/modify/test code)
  </task_structure>
</file_template>

<task_organization>
  <phase_1>Setup and Foundation</phase_1>
  <phase_2>Core Implementation</phase_2>
  <phase_3>Integration and Testing</phase_3>
  <phase_4>Validation and Deployment</phase_4>
</task_organization>

<task_template>
  ## Phase 1: Setup and Foundation

  ### 1. Project Setup and Dependencies
  - [ ] **Install required dependencies**
    - *Scope:* Add new packages to package.json if needed
    - *References:* Technical spec external dependencies
    - *Deliverable:* Updated package.json and successful npm install

    - [ ] Install [SPECIFIC_PACKAGE] for [SPECIFIC_PURPOSE]
    - [ ] Update TypeScript types for new dependencies
    - [ ] Verify no dependency conflicts

  ### 2. Database Schema (if applicable)
  - [ ] **Create database migrations**
    - *Scope:* Implement data model changes
    - *References:* Design.md data models section
    - *Deliverable:* Working database schema

    - [ ] Create migration for [TABLE_NAME] table
    - [ ] Add indexes and constraints as specified
    - [ ] Test migration rollback functionality

  ### 3. Type Definitions and Interfaces
  - [ ] **Define TypeScript interfaces**
    - *Scope:* Create type definitions for all data structures
    - *References:* Design.md component interfaces
    - *Deliverable:* Strongly typed interfaces

    - [ ] Create [ENTITY_NAME] interface matching database schema
    - [ ] Define request/response types for API endpoints
    - [ ] Export types from centralized location

  ## Phase 2: Core Implementation

  ### 4. Backend API Implementation
  - [ ] **Create API endpoints**
    - *Scope:* Implement server-side logic
    - *References:* Acceptance criteria [CRITERION_REFERENCE]
    - *Deliverable:* Working API endpoints

    - [ ] Implement [HTTP_METHOD] [ENDPOINT_PATH] endpoint
    - [ ] Add input validation using [VALIDATION_LIBRARY]
    - [ ] Implement error handling per design.md strategy
    - [ ] Add authentication/authorization checks

  ### 5. Service Layer Implementation
  - [ ] **Create business logic services**
    - *Scope:* Implement core business logic
    - *References:* User story [STORY_REFERENCE]
    - *Deliverable:* Testable service classes

    - [ ] Create [SERVICE_NAME] with core methods
    - [ ] Implement data access patterns
    - [ ] Add logging and error handling
    - [ ] Ensure service is mockable for testing

  ### 6. Frontend Components (if applicable)
  - [ ] **Create UI components**
    - *Scope:* Build user interface elements
    - *References:* User story workflows and acceptance criteria
    - *Deliverable:* Functional UI components

    - [ ] Create [COMPONENT_NAME] component
    - [ ] Implement component props and state management
    - [ ] Add form validation and error display
    - [ ] Style component according to design system

  ## Phase 3: Integration and Testing

  ### 7. Unit Testing (Early Testing Priority)
  - [ ] **Write unit tests for core logic**
    - *Scope:* Test business logic and utilities
    - *References:* Acceptance criteria testing requirements
    - *Deliverable:* >90% test coverage for core functions

    - [ ] Test [SERVICE_NAME] methods with edge cases
    - [ ] Test validation functions with invalid inputs
    - [ ] Mock external dependencies in tests
    - [ ] Verify error handling paths

  ### 8. Integration Testing
  - [ ] **Test component integration**
    - *Scope:* Test API and database integration
    - *References:* Design.md integration points
    - *Deliverable:* Working integration test suite

    - [ ] Test API endpoints with real database
    - [ ] Test frontend-backend integration
    - [ ] Verify authentication flows
    - [ ] Test error scenarios end-to-end

  ### 9. Acceptance Criteria Validation
  - [ ] **Verify acceptance criteria compliance**
    - *Scope:* Test each WHEN/THEN/SHALL requirement
    - *References:* Spec.md acceptance criteria section
    - *Deliverable:* All acceptance criteria passing

    - [ ] Test: WHEN [EVENT], THEN system SHALL [RESPONSE]
    - [ ] Test: IF [CONDITION], THEN system SHALL [BEHAVIOR]
    - [ ] Test all edge cases identified in requirements
    - [ ] Verify Definition of Done criteria

  ## Phase 4: Validation and Deployment

  ### 10. End-to-End Testing
  - [ ] **Create E2E test scenarios**
    - *Scope:* Test complete user workflows
    - *References:* User story workflows
    - *Deliverable:* Automated E2E test coverage

    - [ ] Test happy path user journey
    - [ ] Test error scenarios and recovery
    - [ ] Test cross-browser compatibility
    - [ ] Verify mobile responsiveness

  ### 11. Performance and Security Validation
  - [ ] **Validate performance requirements**
    - *Scope:* Ensure system meets performance criteria
    - *References:* Design.md performance requirements
    - *Deliverable:* Performance benchmarks met

    - [ ] Load test API endpoints
    - [ ] Verify database query performance
    - [ ] Test security vulnerabilities
    - [ ] Validate rate limiting (if applicable)

  ### 12. Documentation and Deployment Preparation
  - [ ] **Prepare for deployment**
    - *Scope:* Document and prepare for production
    - *References:* All implementation artifacts
    - *Deliverable:* Production-ready feature

    - [ ] Update API documentation
    - [ ] Create deployment checklist
    - [ ] Verify environment configurations
    - [ ] Prepare rollback plan

  ## Task Dependencies

  ```mermaid
  graph TD
      A[Setup & Dependencies] --> B[Database Schema]
      A --> C[Type Definitions]
      B --> D[API Implementation]
      C --> D
      D --> E[Service Layer]
      E --> F[Frontend Components]
      F --> G[Unit Testing]
      D --> G
      G --> H[Integration Testing]
      H --> I[Acceptance Criteria]
      I --> J[E2E Testing]
      J --> K[Performance Validation]
      K --> L[Documentation]
  ```

  ## Quality Gates

  Before moving to next phase:
  - [ ] All current phase tasks completed
  - [ ] Tests passing for implemented functionality
  - [ ] Code review completed (if working in team)
  - [ ] No orphaned or incomplete code remains
</task_template>

</step>

<step number="4" name="task_validation">

### Step 4: Task Validation and Review

Present the completed tasks.md to the user for validation, specifically asking for approval of the task breakdown quality and completeness.

<validation_request>
  I've created the enhanced implementation tasks with Kiro-inspired methodology:

  **Implementation Tasks:** @.agent-os/specs/YYYY-MM-DD-spec-name/tasks.md

  **Task Breakdown Features:**
  ✅ **Max 2-Level Hierarchy** - Organized main tasks with manageable sub-tasks
  ✅ **Coding-Focused Tasks** - Specific write/modify/test code actions
  ✅ **Incremental Building** - Each task builds upon previous work
  ✅ **Early Testing Priority** - Testing integrated throughout development
  ✅ **Requirement Traceability** - Each task references specific requirements
  ✅ **No Orphaned Code** - Every change contributes to working functionality
  ✅ **Quality Gates** - Phase completion checkpoints

  **Task Organization:**
  - **Phase 1:** Setup and Foundation
  - **Phase 2:** Core Implementation
  - **Phase 3:** Integration and Testing
  - **Phase 4:** Validation and Deployment

  **Review Questions:**
  1. Are the tasks manageable and clearly scoped?
  2. Do all tasks reference specific requirements or acceptance criteria?
  3. Is the incremental building approach logical?
  4. Are testing tasks appropriately prioritized?
  5. Will this approach avoid orphaned code?

  **Do the tasks look good?** If so, you can begin implementation. If not, please let me know what needs to be adjusted and I'll revise the task breakdown.
</validation_request>

<iteration_logic>
  IF user_requests_changes:
    MODIFY tasks based on feedback
    RE-PRESENT for validation
    REPEAT until approval
  ELSE:
    PROCEED to implementation readiness
</iteration_logic>

</step>

<step number="5" name="completion">

### Step 5: Implementation Readiness

Once user approves the tasks, provide implementation guidance and next steps.

<completion_message>
  Excellent! The enhanced implementation tasks are approved.

  **Implementation Guidance:**
  - Follow tasks in sequential order for best results
  - Complete all sub-tasks in a main task before moving to next
  - Run tests frequently to catch issues early
  - Reference the original requirements when in doubt
  - Use the task dependencies diagram to understand relationships

  **Next Steps:**
  - Begin with Phase 1: Setup and Foundation
  - Check off completed tasks for progress tracking
  - Run `/ao:execute-tasks` if you want guided implementation assistance
  - Ensure each phase's quality gates are met before proceeding

  **Enhancement Benefits:**
  ✅ Manageable, coding-focused tasks
  ✅ Incremental building prevents orphaned code
  ✅ Early testing catches issues sooner
  ✅ Clear requirement traceability
  ✅ Quality gates ensure completeness
  ✅ Dependency visualization shows relationships

  You now have a comprehensive blueprint for implementing the feature with confidence.
</completion_message>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>