---
description: Enhanced Task Execution Rules for Agent OS (Kiro-inspired guided implementation)
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Enhanced Task Execution Rules

## Overview

Provide guided implementation assistance with comprehensive context awareness, clear implementation strategies, and iterative validation for approved tasks.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="context-fetcher" name="comprehensive_context_gathering">

### Step 1: Comprehensive Context Gathering

Use the context-fetcher subagent to read ALL specification documents in the relevant spec directory to build complete implementation context.

<required_documents>
  1. **Requirements:** @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
  2. **Tasks:** @.agent-os/specs/YYYY-MM-DD-spec-name/tasks.md
  3. **Design:** @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/design.md (if exists)
  4. **Technical Spec:** @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/technical-spec.md (if exists)
  5. **API Spec:** @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/api-spec.md (if exists)
  6. **Database Schema:** @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/database-schema.md (if exists)
</required_documents>

<context_validation>
  IF tasks.md not found:
    ERROR: "No tasks.md found. Please run /ao:create-tasks-enhanced first"
    HALT process
  IF spec.md not found:
    ERROR: "No spec.md found. Please run /ao:create-spec-enhanced first"
    HALT process
  ELSE:
    CONTINUE with context analysis
</context_validation>

</step>

<step number="2" name="context_summary_and_relationships">

### Step 2: Context Summary and Relationships

Analyze and summarize the relationships between requirements, design, and tasks to ensure coherent implementation approach.

<context_analysis_template>
  ## Implementation Context Summary

  ### Requirements Overview
  **Feature Goal:** [MAIN_OBJECTIVE_FROM_SPEC]
  **Key User Stories:** [PRIMARY_USER_STORIES]
  **Critical Acceptance Criteria:** [KEY_EARS_CRITERIA]

  ### Design Architecture
  **System Architecture:** [ARCHITECTURAL_APPROACH]
  **Key Components:** [MAIN_COMPONENTS]
  **Data Models:** [CORE_DATA_STRUCTURES]
  **Integration Points:** [EXTERNAL_INTEGRATIONS]

  ### Task Organization
  **Total Tasks:** [TASK_COUNT]
  **Current Phase:** [CURRENT_PHASE]
  **Next Milestone:** [NEXT_QUALITY_GATE]

  ### Context Relationships
  - **Requirements → Design:** [HOW_DESIGN_ADDRESSES_REQUIREMENTS]
  - **Design → Tasks:** [HOW_TASKS_IMPLEMENT_DESIGN]
  - **Cross-References:** [TRACEABILITY_CONNECTIONS]

  ### Implementation Strategy
  **Incremental Approach:** [BUILDING_STRATEGY]
  **Testing Integration:** [TESTING_APPROACH]
  **Quality Gates:** [COMPLETION_CRITERIA]
</context_analysis_template>

<user_presentation>
  Present context summary to user and ask:
  "I've analyzed the complete specification context. The implementation will follow [APPROACH_SUMMARY].

  Available commands:
  - `implement` - Start with next uncompleted task
  - `implement [task number]` - Start with specific task
  - `continue` - Continue from where we left off
  - `status` - Show current progress

  How would you like to proceed?"
</user_presentation>

</step>

<step number="3" name="task_execution_loop">

### Step 3: Task Execution Loop

Execute tasks based on user commands with detailed explanation and validation for each task.

<execution_commands>
  <implement_command>
    TRIGGER: user types "implement" or "implement [number]"
    ACTION: Execute next task or specified task number
  </implement_command>
  <continue_command>
    TRIGGER: user types "continue"
    ACTION: Resume from last incomplete task
  </continue_command>
  <status_command>
    TRIGGER: user types "status"
    ACTION: Show progress summary and next steps
  </status_command>
</execution_commands>

<task_execution_process>
  FOR each task to be implemented:

  ### Step 3a: Task Analysis and Planning

  <task_analysis_template>
    ## Task Implementation Plan

    **Task:** [TASK_NUMBER] - [TASK_TITLE]
    **Scope:** [TASK_SCOPE_FROM_TASKS_MD]
    **References:** [REQUIREMENT_REFERENCES]
    **Deliverable:** [EXPECTED_OUTCOME]

    ### Implementation Approach
    **Strategy:** [HOW_TO_IMPLEMENT_THIS_TASK]
    **Files to Modify:**
    - `[FILE_PATH]` - [MODIFICATION_TYPE] - [REASON]
    - `[FILE_PATH]` - [MODIFICATION_TYPE] - [REASON]

    ### Sub-tasks to Complete
    - [ ] [SUB_TASK_1]
    - [ ] [SUB_TASK_2]
    - [ ] [SUB_TASK_3]

    **Acceptance Criteria Connection:**
    This task addresses: [SPECIFIC_ACCEPTANCE_CRITERIA_REFERENCE]

    **Dependencies:**
    - Requires: [PREREQUISITE_TASKS]
    - Enables: [DEPENDENT_TASKS]
  </task_analysis_template>

  ### Step 3b: User Approval for Approach

  <approach_validation>
    Present implementation plan to user and ask:
    "This is my implementation approach for [TASK_TITLE].

    I will modify [FILE_COUNT] files using [STRATEGY_SUMMARY].

    Does this approach look correct? Should I proceed with implementation?"

    IF user_approves:
      CONTINUE to implementation
    ELSE:
      REVISE approach based on feedback
      RE-PRESENT for approval
  </approach_validation>

  ### Step 3c: Code Implementation

  <implementation_process>
    For each file modification:
    1. EXPLAIN what changes are being made and why
    2. IMPLEMENT code according to design and requirements
    3. ENSURE code follows project conventions
    4. ADD appropriate comments if complex logic
    5. VERIFY implementation matches acceptance criteria
  </implementation_process>

  ### Step 3d: Task Completion and Validation

  <completion_process>
    After implementing all sub-tasks:
    1. MARK task as completed in tasks.md
    2. SUMMARIZE what was implemented
    3. REFERENCE which acceptance criteria are now satisfied
    4. IDENTIFY any issues or deviations
    5. ASK user for validation
  </completion_process>

  <completion_template>
    ## Task Completed: [TASK_TITLE]

    ### Implementation Summary
    **Files Modified:**
    - `[FILE_PATH]` - [WHAT_WAS_CHANGED]
    - `[FILE_PATH]` - [WHAT_WAS_CHANGED]

    **Acceptance Criteria Satisfied:**
    - ✅ [CRITERIA_1] - [HOW_SATISFIED]
    - ✅ [CRITERIA_2] - [HOW_SATISFIED]

    **Next Steps:**
    - [NEXT_TASK_NUMBER]: [NEXT_TASK_TITLE]
    - Dependencies now satisfied: [UNLOCKED_TASKS]

    **Validation Questions:**
    1. Does the implementation match your expectations?
    2. Should we continue to the next task?
    3. Any adjustments needed before proceeding?

    Please review the implementation. Does the output match your expectations?
  </completion_template>

  <validation_loop>
    IF user_requests_changes:
      MODIFY implementation based on feedback
      RE-PRESENT for validation
      REPEAT until approval
    ELSE:
      MARK task as completed
      UPDATE progress tracking
      PROCEED to next task (if continuing)
  </validation_loop>

</task_execution_process>

</step>

<step number="4" name="progress_tracking">

### Step 4: Progress Tracking and Status Management

Maintain real-time progress tracking and provide clear status updates.

<progress_tracking_system>
  <task_status_management>
    - TRACK completed tasks in tasks.md with checkmarks
    - UPDATE progress percentage
    - IDENTIFY blocked or dependent tasks
    - MAINTAIN next action clarity
  </task_status_management>

  <status_report_template>
    ## Implementation Progress Status

    **Overall Progress:** [COMPLETED_TASKS] / [TOTAL_TASKS] ([PERCENTAGE]%)

    ### Phase Status
    - **Phase 1 (Setup):** [STATUS] - [PHASE_PROGRESS]
    - **Phase 2 (Core):** [STATUS] - [PHASE_PROGRESS]
    - **Phase 3 (Integration):** [STATUS] - [PHASE_PROGRESS]
    - **Phase 4 (Validation):** [STATUS] - [PHASE_PROGRESS]

    ### Recently Completed
    - ✅ [TASK_NUMBER]: [TASK_TITLE]
    - ✅ [TASK_NUMBER]: [TASK_TITLE]

    ### Current Task
    - 🔄 [TASK_NUMBER]: [TASK_TITLE] ([SUB_TASK_PROGRESS])

    ### Next Up
    - ⏳ [TASK_NUMBER]: [TASK_TITLE]
    - ⏳ [TASK_NUMBER]: [TASK_TITLE]

    ### Blocked/Waiting
    - ⚠️ [TASK_NUMBER]: [TASK_TITLE] - [BLOCKING_REASON]

    **Quality Gates:**
    - [GATE_NAME]: [STATUS] - [CRITERIA_MET]

    **Commands Available:**
    - `continue` - Resume current task
    - `implement [number]` - Jump to specific task
    - `status` - Refresh this status
  </status_report_template>
</progress_tracking_system>

</step>

<step number="5" name="completion_and_validation">

### Step 5: Feature Completion and Final Validation

When all tasks are completed, provide comprehensive feature validation and next steps.

<feature_completion_process>
  WHEN all tasks marked complete:

  ### Step 5a: Final Implementation Review

  <completion_summary_template>
    ## Feature Implementation Complete! 🎉

    **Feature:** [FEATURE_NAME]
    **Total Tasks Completed:** [COMPLETED_COUNT]
    **Implementation Time:** [DURATION]

    ### Acceptance Criteria Validation
    **Requirements Met:**
    - ✅ [USER_STORY_1] - All acceptance criteria satisfied
    - ✅ [USER_STORY_2] - All acceptance criteria satisfied
    - ✅ [EDGE_CASES] - All edge cases handled

    ### Quality Gates Passed
    - ✅ **Setup & Foundation** - All dependencies and schemas ready
    - ✅ **Core Implementation** - All business logic implemented
    - ✅ **Integration & Testing** - All tests passing
    - ✅ **Validation & Deployment** - Ready for production

    ### Files Modified/Created
    - [FILE_PATH] - [MODIFICATION_SUMMARY]
    - [FILE_PATH] - [MODIFICATION_SUMMARY]

    ### Testing Status
    - **Unit Tests:** [STATUS] - [COVERAGE]%
    - **Integration Tests:** [STATUS]
    - **E2E Tests:** [STATUS]
    - **Acceptance Tests:** [STATUS]
  </completion_summary_template>

  ### Step 5b: Final User Validation

  <final_validation>
    Present complete feature to user:
    "The [FEATURE_NAME] feature has been fully implemented according to specifications.

    All acceptance criteria have been satisfied and quality gates passed.

    **Final Validation Questions:**
    1. Does the complete implementation match your requirements?
    2. Are there any adjustments needed before considering this done?
    3. Should we proceed with deployment preparation?

    Please test the feature and confirm it meets your expectations."

    IF user_requests_final_changes:
      IDENTIFY specific tasks that need modification
      RE-IMPLEMENT affected tasks
      RE-VALIDATE until approval
    ELSE:
      MARK feature as completed
      PROVIDE deployment guidance
  </final_validation>

</feature_completion_process>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>