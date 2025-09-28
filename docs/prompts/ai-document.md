# Prompts for In-Depth Technical Documentation

> Use these prompts to generate in-depth technical documents that explain a system's architecture, design rationale, and results in a direct, analytical style.

## 🎯 Core Principle: Signal Over Noise

These prompts are designed to generate documentation that:
- Explains complex systems with clarity and precision.
- Focuses on principles, rationale, and verifiable facts.
- Avoids marketing jargon, hyperbole, and sales-oriented language.
- Is written for a technical audience of architects, technical leads, and engineers.

## 📈 Prompt Templates

### 1. `../TECHNICAL-ARCHITECTURE.md`

```
Create a detailed technical architecture document for my [PROJECT_TYPE].

The document should explain the system's design, the rationale behind key decisions, and its implementation. The target audience is technical leaders and architects.

PROJECT CONTEXT:
- Tech Stack: [TECH_STACK]
- Key Features: [List of key features]

DOCUMENTATION SECTIONS:

**1. System Overview**
- High-level architecture diagram.
- Explanation of the core components and their responsibilities.

**2. Core Architectural Patterns**
- Describe the primary patterns used (e.g., service layer, state management, event-driven architecture).
- For each pattern, explain the underlying principle and why it was chosen.
- Include clear code examples that illustrate the pattern.

**3. Multi-Agent Architecture (If applicable)**
- Agent coordination strategy and communication protocols.
- State management across different agents.
- Error handling and recovery mechanisms.

**4. Data Flow and Management**
- How data is ingested, processed, and stored.
- Schema definitions and data integrity rules.

**5. Security Model**
- Authentication and authorization mechanisms.
- Data security and privacy considerations.
- Environment-specific security configurations (development vs. production).

Adopt a direct, analytical tone. The goal is to provide a clear and factual explanation of the system's design.
```

### 2. `QUANTIFIED-RESULTS.md`

```
Create a document named `QUANTIFIED-RESULTS.md` that details the measurable outcomes of the [PROJECT_TYPE] project.

Present the data factually, without hyperbole or a sales-oriented narrative. The audience is technical and project leadership.

METRIC CATEGORIES:

**1. Efficiency Metrics**
- Feature delivery time (e.g., average cycle time before and after).
- Developer onboarding time (e.g., time to first meaningful contribution).
- Code review workload (e.g., time spent on architectural vs. business logic review).

**2. Quality and Reliability Metrics**
- Reduction in architecture violations or specific bug classes.
- Production stability (e.g., number of architecture-related incidents).
- Performance metrics (e.g., response times, resource utilization).

**3. AI-Assisted Development Metrics (If applicable)**
- Percentage of code generated or assisted by AI.
- Impact on specific phases (e.g., scaffolding, testing, documentation).

For each metric, provide the number, the context for the measurement, and a brief, neutral description of the result.
```

### 3. `OPERATIONS-AND-DEPLOYMENT.md`

```
Create a document named `OPERATIONS-AND-DEPLOYMENT.md` that describes the project's approach to deployment, monitoring, and maintenance.

The focus should be on the technical implementation and procedures.

SECTIONS TO INCLUDE:

**1. Deployment Strategy**
- Build process and packaging (e.g., containerization).
- Environment management (development, staging, production).
- CI/CD pipeline configuration and workflow.

**2. Monitoring and Observability**
- Logging strategy and tools.
- Key metrics collected for performance and health monitoring.
- Alerting and error tracking setup.

**3. Infrastructure**
- Core infrastructure components (e.g., servers, databases, network).
- Configuration management approach (e.g., Infrastructure as Code).
- Scaling and disaster recovery plans.

Provide specific configuration examples and command snippets where appropriate.
```

### 4. `CASE-STUDY.md`

```
Create a `CASE-STUDY.md` document that provides a factual summary of the [PROJECT_TYPE] project.

The document should consolidate information from the architecture, results, and operations documents into a concise overview. The tone should be analytical and direct.

CASE STUDY STRUCTURE:

**1. Problem Statement**
- A brief description of the core technical or business problem the project addressed.

**2. Technical Solution**
- A summary of the key architectural patterns and design decisions.
- An explanation of how the solution addresses the problem statement.

**3. Quantified Results**
- A high-level summary of the most significant metrics from `QUANTIFIED-RESULTS.md`.

**4. Key Project Assets**
- Links to the detailed documentation (`../TECHNICAL-ARCHITECTURE.md`, etc.).
- Links to the source code repository and live demo, if available.

This document serves as a self-contained summary for other technical teams.
```

## 🎯 Documentation Guidelines

### ✅ DO:
- Be direct, clear, and analytical.
- Explain the principles and rationale behind decisions.
- Use precise, unambiguous language.
- Ground all statements in facts and evidence (code, metrics).
- Include clear, illustrative code examples.

### ❌ DON'T:
- Use marketing jargon ("revolutionary," "paradigm-shifting," "world-class").
- Frame the document as a sales pitch or a "showcase."
- Make exaggerated or unsubstantiated claims.
- Focus on "business value" or "ROI" in a marketing context.
- Write for a non-technical executive audience.
