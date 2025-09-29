---
description: Enhanced Spec Creation Rules for Agent OS (with Kiro-inspired improvements)
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Enhanced Spec Creation Rules

## Overview

Generate detailed feature specifications with formal acceptance criteria, edge case coverage, and iterative validation, aligned with product roadmap and mission.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
  EXECUTE: @.agent-os/instructions/core/portfolio-integration-guard.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="context-fetcher" name="spec_initiation">

### Step 1: Spec Initiation

Use the context-fetcher subagent to identify spec initiation method by either finding the next uncompleted roadmap item when user asks "what's next?" or accepting a specific spec idea from the user.

<option_a_flow>
  <trigger_phrases>
    - "what's next?"
  </trigger_phrases>
  <actions>
    1. CHECK @.agent-os/product/roadmap.md
    2. FIND next uncompleted item
    3. SUGGEST item to user
    4. WAIT for approval
  </actions>
</option_a_flow>

<option_b_flow>
  <trigger>user describes specific spec idea</trigger>
  <accept>any format, length, or detail level</accept>
  <proceed>to context gathering</proceed>
</option_b_flow>

</step>

<step number="2" subagent="context-fetcher" name="context_gathering">

### Step 2: Context Gathering (Conditional)

Use the context-fetcher subagent to read @.agent-os/product/mission-lite.md and @.agent-os/product/tech-stack.md only if not already in context to ensure minimal context for spec alignment.

<conditional_logic>
  IF both mission-lite.md AND tech-stack.md already read in current context:
    SKIP this entire step
    PROCEED to step 3
  ELSE:
    READ only files not already in context:
      - mission-lite.md (if not in context)
      - tech-stack.md (if not in context)
    CONTINUE with context analysis
</conditional_logic>

<context_analysis>
  <mission_lite>core product purpose and value</mission_lite>
  <tech_stack>technical requirements</tech_stack>
</context_analysis>

</step>

<step number="3" subagent="context-fetcher" name="requirements_clarification">

### Step 3: Requirements Clarification

Use the context-fetcher subagent to clarify scope boundaries and technical considerations by asking numbered questions as needed to ensure clear requirements before proceeding.

<clarification_areas>
  <scope>
    - in_scope: what is included
    - out_of_scope: what is excluded (optional)
  </scope>
  <technical>
    - functionality specifics
    - UI/UX requirements
    - integration points
    - edge cases and constraints
    - error handling scenarios
  </technical>
</clarification_areas>

<decision_tree>
  IF clarification_needed:
    ASK numbered_questions
    WAIT for_user_response
  ELSE:
    PROCEED to_date_determination
</decision_tree>

</step>

<step number="4" subagent="date-checker" name="date_determination">

### Step 4: Date Determination

Use the date-checker subagent to determine the current date in YYYY-MM-DD format for folder naming. The subagent will output today's date which will be used in subsequent steps.

<subagent_output>
  The date-checker subagent will provide the current date in YYYY-MM-DD format at the end of its response. Store this date for use in folder naming in step 5.
</subagent_output>

</step>

<step number="5" subagent="file-creator" name="spec_folder_creation">

### Step 5: Spec Folder Creation

Use the file-creator subagent to create directory: .agent-os/specs/YYYY-MM-DD-spec-name/ using the date from step 4.

Use kebab-case for spec name. Maximum 5 words in name.

<folder_naming>
  <format>YYYY-MM-DD-spec-name</format>
  <date>use stored date from step 4</date>
  <name_constraints>
    - max_words: 5
    - style: kebab-case
    - descriptive: true
  </name_constraints>
</folder_naming>

<example_names>
  - 2025-03-15-password-reset-flow
  - 2025-03-16-user-profile-dashboard
  - 2025-03-17-api-rate-limiting
</example_names>

</step>

<step number="6" subagent="file-creator" name="create_spec_md">

### Step 6: Create spec.md with Enhanced Requirements

Use the file-creator subagent to create the file: .agent-os/specs/YYYY-MM-DD-spec-name/spec.md using this enhanced template:

<file_template>
  <header>
    # Spec Requirements Document

    > Spec: [SPEC_NAME]
    > Created: [CURRENT_DATE]
  </header>
  <required_sections>
    - Overview
    - User Stories with Acceptance Criteria
    - Edge Cases and Constraints
    - Spec Scope
    - Out of Scope
    - Expected Deliverable
  </required_sections>
</file_template>

<section name="overview">
  <template>
    ## Overview

    [1-2_SENTENCE_GOAL_AND_OBJECTIVE]
  </template>
  <constraints>
    - length: 1-2 sentences
    - content: goal and objective
  </constraints>
  <example>
    Implement a secure password reset functionality that allows users to regain account access through email verification. This feature will reduce support ticket volume and improve user experience by providing self-service account recovery.
  </example>
</section>

<section name="user_stories_enhanced">
  <template>
    ## User Stories with Acceptance Criteria

    ### [STORY_TITLE]

    As a [USER_TYPE], I want to [ACTION], so that [BENEFIT].

    **Workflow:**
    [DETAILED_WORKFLOW_DESCRIPTION]

    **Acceptance Criteria:**
    1. **WHEN** [event/trigger], **THEN** [system] **SHALL** [specific response]
    2. **IF** [precondition], **THEN** [system] **SHALL** [specific behavior]
    3. **WHEN** [error condition], **THEN** [system] **SHALL** [error handling response]

    **Definition of Done:**
    - [ ] [TESTABLE_OUTCOME_1]
    - [ ] [TESTABLE_OUTCOME_2]
    - [ ] [TESTABLE_OUTCOME_3]
  </template>
  <constraints>
    - count: 1-3 stories
    - include: workflow, acceptance criteria (EARS format), definition of done
    - format: title + story + workflow + criteria + DoD
  </constraints>
  <example>
    ### Password Reset Request

    As a **user**, I want to **request a password reset**, so that **I can regain access to my account when I forget my password**.

    **Workflow:**
    1. User navigates to sign-in page and clicks "Forgot Password"
    2. User enters their email address
    3. System validates email and sends reset link
    4. User receives email with time-limited reset token
    5. User clicks link and creates new password

    **Acceptance Criteria:**
    1. **WHEN** user submits valid email address, **THEN** system **SHALL** send password reset email within 30 seconds
    2. **IF** email address is not registered, **THEN** system **SHALL** display generic "reset email sent" message for security
    3. **WHEN** reset token is older than 1 hour, **THEN** system **SHALL** reject the reset attempt with clear error message

    **Definition of Done:**
    - [ ] Password reset email delivered successfully
    - [ ] Reset token expires after 1 hour
    - [ ] User can set new password using valid token
  </example>
</section>

<section name="edge_cases">
  <template>
    ## Edge Cases and Constraints

    ### Edge Cases
    1. **[EDGE_CASE_SCENARIO]** - [EXPECTED_SYSTEM_BEHAVIOR]
    2. **[ERROR_CONDITION]** - [ERROR_HANDLING_APPROACH]

    ### Technical Constraints
    - **Performance:** [SPECIFIC_PERFORMANCE_REQUIREMENTS]
    - **Security:** [SECURITY_CONSIDERATIONS]
    - **Scalability:** [SCALABILITY_REQUIREMENTS]
    - **Integration:** [INTEGRATION_CONSTRAINTS]

    ### User Experience Constraints
    - **Accessibility:** [A11Y_REQUIREMENTS]
    - **Mobile:** [MOBILE_SPECIFIC_REQUIREMENTS]
    - **Browser:** [BROWSER_SUPPORT_REQUIREMENTS]
  </template>
  <purpose>Explicitly address edge cases, error conditions, and system constraints</purpose>
  <example>
    ### Edge Cases
    1. **Multiple simultaneous reset requests** - System shall honor only the most recent token and invalidate previous ones
    2. **User attempts reset for non-existent email** - System shall display generic success message without revealing email validity

    ### Technical Constraints
    - **Performance:** Password reset email must be sent within 30 seconds
    - **Security:** Reset tokens must be cryptographically secure and single-use
    - **Integration:** Must integrate with existing Supabase Auth system

    ### User Experience Constraints
    - **Accessibility:** Reset form must be keyboard navigable and screen reader compatible
    - **Mobile:** Reset flow must work seamlessly on mobile devices
  </example>
</section>

<section name="spec_scope">
  <template>
    ## Spec Scope

    1. **[FEATURE_NAME]** - [ONE_SENTENCE_DESCRIPTION]
    2. **[FEATURE_NAME]** - [ONE_SENTENCE_DESCRIPTION]
  </template>
  <constraints>
    - count: 1-5 features
    - format: numbered list
    - description: one sentence each
  </constraints>
</section>

<section name="out_of_scope">
  <template>
    ## Out of Scope

    - [EXCLUDED_FUNCTIONALITY_1]
    - [EXCLUDED_FUNCTIONALITY_2]
  </template>
  <purpose>explicitly exclude functionalities</purpose>
</section>

<section name="expected_deliverable">
  <template>
    ## Expected Deliverable

    1. [TESTABLE_OUTCOME_1]
    2. [TESTABLE_OUTCOME_2]
  </template>
  <constraints>
    - count: 1-3 expectations
    - focus: browser-testable outcomes
  </constraints>
</section>

</step>

<step number="7" subagent="file-creator" name="create_spec_lite_md">

### Step 7: Create spec-lite.md

Use the file-creator subagent to create the file: .agent-os/specs/YYYY-MM-DD-spec-name/spec-lite.md for the purpose of establishing a condensed spec for efficient AI context usage.

<file_template>
  <header>
    # Spec Summary (Lite)
  </header>
</file_template>

<content_structure>
  <spec_summary>
    - source: Step 6 spec.md overview section
    - length: 1-3 sentences
    - content: core goal and objective of the feature
  </spec_summary>
</content_structure>

<content_template>
  [1-3_SENTENCES_SUMMARIZING_SPEC_GOAL_AND_OBJECTIVE]
</content_template>

<example>
  Implement secure password reset via email verification to reduce support tickets and enable self-service account recovery. Users can request a reset link, receive a time-limited token via email, and set a new password following security best practices.
</example>

</step>

<step number="8" subagent="file-creator" name="create_technical_spec">

### Step 8: Create Technical Specification

Use the file-creator subagent to create the file: sub-specs/technical-spec.md using this template:

<file_template>
  <header>
    # Technical Specification

    This is the technical specification for the spec detailed in @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
  </header>
</file_template>

<spec_sections>
  <technical_requirements>
    - functionality details
    - UI/UX specifications
    - integration requirements
    - performance criteria
  </technical_requirements>
  <external_dependencies_conditional>
    - only include if new dependencies needed
    - new libraries/packages
    - justification for each
    - version requirements
  </external_dependencies_conditional>
</spec_sections>

<example_template>
  ## Technical Requirements

  - [SPECIFIC_TECHNICAL_REQUIREMENT]
  - [SPECIFIC_TECHNICAL_REQUIREMENT]

  ## External Dependencies (Conditional)

  [ONLY_IF_NEW_DEPENDENCIES_NEEDED]
  - **[LIBRARY_NAME]** - [PURPOSE]
  - **Justification:** [REASON_FOR_INCLUSION]
</example_template>

<conditional_logic>
  IF spec_requires_new_external_dependencies:
    INCLUDE "External Dependencies" section
  ELSE:
    OMIT section entirely
</conditional_logic>

</step>

<step number="9" subagent="file-creator" name="create_database_schema">

### Step 9: Create Database Schema (Conditional)

Use the file-creator subagent to create the file: sub-specs/database-schema.md ONLY IF database changes needed for this task.

<decision_tree>
  IF spec_requires_database_changes:
    CREATE sub-specs/database-schema.md
  ELSE:
    SKIP this_step
</decision_tree>

<file_template>
  <header>
    # Database Schema

    This is the database schema implementation for the spec detailed in @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
  </header>
</file_template>

<schema_sections>
  <changes>
    - new tables
    - new columns
    - modifications
    - migrations
  </changes>
  <specifications>
    - exact SQL or migration syntax
    - indexes and constraints
    - foreign key relationships
  </specifications>
  <rationale>
    - reason for each change
    - performance considerations
    - data integrity rules
  </rationale>
</schema_sections>

</step>

<step number="10" subagent="file-creator" name="create_api_spec">

### Step 10: Create API Specification (Conditional)

Use the file-creator subagent to create file: sub-specs/api-spec.md ONLY IF API changes needed.

<decision_tree>
  IF spec_requires_api_changes:
    CREATE sub-specs/api-spec.md
  ELSE:
    SKIP this_step
</decision_tree>

<file_template>
  <header>
    # API Specification

    This is the API specification for the spec detailed in @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
  </header>
</file_template>

<api_sections>
  <routes>
    - HTTP method
    - endpoint path
    - parameters
    - response format
  </routes>
  <controllers>
    - action names
    - business logic
    - error handling
  </controllers>
  <purpose>
    - endpoint rationale
    - integration with features
  </purpose>
</api_sections>

<endpoint_template>
  ## Endpoints

  ### [HTTP_METHOD] [ENDPOINT_PATH]

  **Purpose:** [DESCRIPTION]
  **Parameters:** [LIST]
  **Response:** [FORMAT]
  **Errors:** [POSSIBLE_ERRORS]
</endpoint_template>

</step>

<step number="11" name="requirements_validation">

### Step 11: Requirements Validation and Review

Present the completed spec.md to the user for validation, specifically asking for approval of the requirements quality and completeness.

<validation_request>
  I've created the enhanced spec documentation with formal acceptance criteria:

  - **Spec Requirements:** @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
    - Includes EARS-format acceptance criteria (WHEN...THEN...SHALL)
    - Covers edge cases and constraints
    - Defines clear Definition of Done criteria

  - **Spec Summary:** @.agent-os/specs/YYYY-MM-DD-spec-name/spec-lite.md
  - **Technical Spec:** @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/technical-spec.md
  [LIST_OTHER_CREATED_SPECS]

  **Review Questions:**
  1. Do the user stories capture all the required functionality?
  2. Are the acceptance criteria specific and testable?
  3. Have we adequately covered edge cases and error scenarios?
  4. Are the technical constraints clearly defined?

  **Please review the requirements. Do they look good?** If so, we can move on to creating the implementation tasks. If not, please let me know what needs to be adjusted and I'll iterate on the specifications.
</validation_request>

<iteration_logic>
  IF user_requests_changes:
    MODIFY specifications based on feedback
    RE-PRESENT for validation
    REPEAT until approval
  ELSE:
    PROCEED to task creation recommendation
</iteration_logic>

</step>

<step number="12" name="completion">

### Step 12: Completion and Next Steps

Once user approves the requirements, provide clear next steps for implementation.

<completion_message>
  Excellent! The enhanced spec requirements are approved.

  **Next Steps:**
  - Run `/ao:create-tasks .agent-os/specs/YYYY-MM-DD-spec-name` to generate implementation tasks
  - The tasks will include test scenarios based on the acceptance criteria
  - Edge cases and constraints will be reflected in the implementation checklist

  **Quality Enhancements Added:**
  ✅ Formal acceptance criteria using EARS format
  ✅ Explicit edge case coverage
  ✅ Technical and UX constraints documented
  ✅ Definition of Done criteria for each story
  ✅ Iterative validation process
</completion_message>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>