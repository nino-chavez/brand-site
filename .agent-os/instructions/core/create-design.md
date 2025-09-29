---
description: Design Creation Rules for Agent OS (Kiro-inspired design phase)
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Design Creation Rules

## Overview

Transform approved requirements into comprehensive technical design with architecture diagrams, component interfaces, and implementation strategy.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
  EXECUTE: @.agent-os/instructions/core/portfolio-integration-guard.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="context-fetcher" name="requirements_validation">

### Step 1: Requirements Validation

Use the context-fetcher subagent to locate and validate that an approved spec exists for this feature.

<validation_process>
  1. CHECK for existing spec directory in @.agent-os/specs/
  2. READ spec.md to understand requirements
  3. VERIFY spec has been approved (not in draft status)
  4. EXTRACT key requirements for design reference
</validation_process>

<decision_tree>
  IF no_approved_spec_found:
    ERROR: "Please run /ao:create-spec-enhanced first to create approved requirements"
    HALT process
  ELSE:
    CONTINUE to design initiation
</decision_tree>

</step>

<step number="2" subagent="context-fetcher" name="technical_context">

### Step 2: Technical Context Gathering

Use the context-fetcher subagent to gather technical context needed for design decisions.

<context_sources>
  - @.agent-os/product/tech-stack.md (if not in context)
  - Existing spec technical-spec.md (if exists)
  - Related system architecture files
</context_sources>

<technical_analysis>
  <architecture_constraints>existing system architecture</architecture_constraints>
  <technology_stack>available technologies and frameworks</technology_stack>
  <integration_points>existing APIs and services</integration_points>
</technical_analysis>

</step>

<step number="3" subagent="file-creator" name="create_design_md">

### Step 3: Create Comprehensive Design Document

Use the file-creator subagent to create the file: sub-specs/design.md with comprehensive technical design.

<file_template>
  <header>
    # Technical Design

    This is the technical design for the spec detailed in @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md

    **Requirements Reference:** @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
  </header>
  <required_sections>
    - Overview
    - Architecture
    - Components and Interfaces
    - Data Models
    - Error Handling
    - Testing Strategy
  </required_sections>
</file_template>

<section name="overview">
  <template>
    ## Overview

    **Feature Summary:** [1-2_SENTENCES_FROM_REQUIREMENTS]

    **Design Goals:**
    - [PRIMARY_DESIGN_GOAL]
    - [SECONDARY_DESIGN_GOAL]
    - [PERFORMANCE_OR_SCALABILITY_GOAL]

    **Architecture Approach:** [HIGH_LEVEL_APPROACH_DESCRIPTION]
  </template>
  <constraints>
    - Reference approved requirements
    - State clear design goals
    - Describe high-level approach
  </constraints>
</section>

<section name="architecture">
  <template>
    ## Architecture

    ### System Architecture

    ```mermaid
    graph TD
        [COMPONENT_A] --> [COMPONENT_B]
        [COMPONENT_B] --> [DATABASE]
        [USER] --> [COMPONENT_A]
    ```

    ### Component Overview
    - **[COMPONENT_NAME]**: [PURPOSE_AND_RESPONSIBILITY]
    - **[COMPONENT_NAME]**: [PURPOSE_AND_RESPONSIBILITY]

    ### Data Flow

    ```mermaid
    sequenceDiagram
        participant User
        participant Frontend
        participant API
        participant Database

        User->>Frontend: [ACTION]
        Frontend->>API: [REQUEST]
        API->>Database: [QUERY]
        Database-->>API: [RESPONSE]
        API-->>Frontend: [DATA]
        Frontend-->>User: [RESULT]
    ```

    ### Integration Points
    - **[EXTERNAL_SERVICE]**: [INTEGRATION_PURPOSE]
    - **[INTERNAL_SERVICE]**: [INTEGRATION_PURPOSE]
  </template>
  <requirements>
    - Use Mermaid.js for all diagrams
    - Show component relationships
    - Include data flow sequences
    - Document integration points
  </requirements>
</section>

<section name="components_interfaces">
  <template>
    ## Components and Interfaces

    ### Frontend Components

    #### [ComponentName]
    - **Purpose:** [COMPONENT_RESPONSIBILITY]
    - **Props Interface:**
      ```typescript
      interface [ComponentName]Props {
        [prop]: [type]; // [description]
        [prop]: [type]; // [description]
      }
      ```
    - **State Management:** [STATE_APPROACH]

    ### API Interfaces

    #### [EndpointName]
    - **Route:** `[METHOD] /api/[endpoint]`
    - **Request Schema:**
      ```typescript
      interface [RequestName] {
        [field]: [type]; // [validation_rules]
      }
      ```
    - **Response Schema:**
      ```typescript
      interface [ResponseName] {
        success: boolean;
        data?: [DataType];
        error?: string;
      }
      ```

    ### Service Interfaces

    #### [ServiceName]
    - **Purpose:** [SERVICE_RESPONSIBILITY]
    - **Methods:**
      ```typescript
      class [ServiceName] {
        [method]([params]): Promise<[ReturnType]>;
      }
      ```
  </template>
  <requirements>
    - Define TypeScript interfaces
    - Specify component responsibilities
    - Document API contracts
    - Include service methods
  </requirements>
</section>

<section name="data_models">
  <template>
    ## Data Models

    ### Database Schema

    ```mermaid
    erDiagram
        [TABLE_A] ||--o{ [TABLE_B] : "relationship"
        [TABLE_A] {
            id uuid PK
            [field] [type]
            created_at timestamp
            updated_at timestamp
        }
        [TABLE_B] {
            id uuid PK
            [table_a_id] uuid FK
            [field] [type]
        }
    ```

    ### TypeScript Types

    #### Core Types
    ```typescript
    interface [EntityName] {
      id: string;
      [field]: [type];
      createdAt: Date;
      updatedAt: Date;
    }

    type [UnionType] = [TYPE_A] | [TYPE_B];
    ```

    #### Request/Response Types
    ```typescript
    interface Create[Entity]Request {
      [field]: [type];
    }

    interface [Entity]Response {
      success: boolean;
      data?: [Entity];
      error?: string;
    }
    ```

    ### Data Validation
    - **Input Validation:** [VALIDATION_APPROACH]
    - **Schema Validation:** [SCHEMA_LIBRARY] (e.g., Zod)
    - **Database Constraints:** [CONSTRAINT_STRATEGY]
  </template>
  <requirements>
    - Show entity relationships with Mermaid ERD
    - Define TypeScript interfaces
    - Specify validation approach
    - Include database constraints
  </requirements>
</section>

<section name="error_handling">
  <template>
    ## Error Handling

    ### Error Classification

    ```mermaid
    graph TD
        [UserError] --> [ValidationError]
        [UserError] --> [AuthorizationError]
        [SystemError] --> [DatabaseError]
        [SystemError] --> [ExternalServiceError]
        [SystemError] --> [NetworkError]
    ```

    ### Error Response Format
    ```typescript
    interface ErrorResponse {
      success: false;
      error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
      };
      timestamp: string;
    }
    ```

    ### Error Handling Strategy
    - **Client-Side Errors:**
      - Form validation errors: [HANDLING_APPROACH]
      - Network failures: [RETRY_STRATEGY]
      - Authorization errors: [REDIRECT_STRATEGY]

    - **Server-Side Errors:**
      - Database failures: [RECOVERY_APPROACH]
      - External service failures: [FALLBACK_STRATEGY]
      - Rate limiting: [THROTTLING_RESPONSE]

    - **User Experience:**
      - Error messages: [MESSAGING_STRATEGY]
      - Loading states: [LOADING_APPROACH]
      - Fallback UI: [FALLBACK_APPROACH]

    ### Logging and Monitoring
    - **Error Logging:** [LOGGING_SERVICE]
    - **Alerting:** [ALERT_STRATEGY]
    - **Performance Monitoring:** [MONITORING_APPROACH]
  </template>
  <requirements>
    - Classify error types
    - Define error response format
    - Specify handling strategies
    - Include monitoring approach
  </requirements>
</section>

<section name="testing_strategy">
  <template>
    ## Testing Strategy

    ### Testing Pyramid

    ```mermaid
    graph TD
        subgraph "E2E Tests"
            [E2E_SCENARIO_1]
            [E2E_SCENARIO_2]
        end
        subgraph "Integration Tests"
            [INTEGRATION_TEST_1]
            [INTEGRATION_TEST_2]
        end
        subgraph "Unit Tests"
            [UNIT_TEST_1]
            [UNIT_TEST_2]
            [UNIT_TEST_3]
        end
    ```

    ### Test Coverage Plan

    #### Unit Tests
    - **Components:** [COMPONENT_TESTING_APPROACH]
    - **Services:** [SERVICE_TESTING_APPROACH]
    - **Utilities:** [UTILITY_TESTING_APPROACH]
    - **Target Coverage:** [COVERAGE_PERCENTAGE]%

    #### Integration Tests
    - **API Endpoints:** [API_TESTING_APPROACH]
    - **Database Operations:** [DATABASE_TESTING_APPROACH]
    - **Service Integration:** [SERVICE_INTEGRATION_TESTING]

    #### End-to-End Tests
    - **User Flows:** [E2E_FLOW_TESTING]
    - **Acceptance Criteria:** Test each acceptance criteria from requirements
    - **Edge Cases:** Test edge cases identified in requirements

    ### Test Data Strategy
    - **Mock Data:** [MOCK_DATA_APPROACH]
    - **Test Database:** [TEST_DB_APPROACH]
    - **Seed Data:** [SEED_DATA_STRATEGY]

    ### Performance Testing
    - **Load Testing:** [LOAD_TEST_STRATEGY]
    - **Stress Testing:** [STRESS_TEST_APPROACH]
    - **Performance Metrics:** [METRICS_TO_TRACK]
  </template>
  <requirements>
    - Define testing pyramid structure
    - Map tests to acceptance criteria
    - Include performance testing
    - Specify test data strategy
  </requirements>
</section>

</step>

<step number="4" name="design_validation">

### Step 4: Design Validation and Review

Present the completed design.md to the user for validation, specifically asking for approval of the technical design quality and completeness.

<validation_request>
  I've created the comprehensive technical design document:

  **Technical Design:** @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/design.md

  **Design Components:**
  ✅ **Architecture Overview** - System architecture with Mermaid diagrams
  ✅ **Component Interfaces** - TypeScript interfaces and API contracts
  ✅ **Data Models** - Database schema and type definitions
  ✅ **Error Handling** - Comprehensive error classification and strategies
  ✅ **Testing Strategy** - Complete testing pyramid and coverage plan

  **Review Questions:**
  1. Does the architecture effectively address all requirements?
  2. Are the component interfaces clear and well-defined?
  3. Is the data model appropriate for the use cases?
  4. Does the error handling strategy cover edge cases?
  5. Is the testing strategy comprehensive and realistic?

  **Does the design look good?** If so, we can move on to creating the implementation tasks. If not, please let me know what needs to be adjusted and I'll iterate on the design.
</validation_request>

<iteration_logic>
  IF user_requests_changes:
    MODIFY design based on feedback
    RE-PRESENT for validation
    REPEAT until approval
  ELSE:
    PROCEED to implementation recommendation
</iteration_logic>

</step>

<step number="5" name="completion">

### Step 5: Completion and Next Steps

Once user approves the design, provide clear next steps for implementation.

<completion_message>
  Excellent! The technical design is approved.

  **Next Steps:**
  - Run `/ao:create-tasks .agent-os/specs/YYYY-MM-DD-spec-name` to generate implementation tasks
  - Tasks will be based on both requirements and approved design
  - Implementation will follow the architecture and interfaces defined

  **Design Artifacts Created:**
  ✅ Architecture diagrams (Mermaid.js)
  ✅ Component and API interfaces (TypeScript)
  ✅ Data models and database schema
  ✅ Error handling and testing strategies
  ✅ Integration and performance considerations

  The design provides a comprehensive blueprint for implementation.
</completion_message>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>