### **Enhanced Claude Prompts for Systems & Architecture Documentation**

These prompts are upgraded to use Claude Sonnet 4.5's capabilities within the VS Code extension, enabling you to generate not just markdown, but also live diagrams and runnable code examples as interactive artifacts.

### 🎯 **Core Strategy: From Static Docs to Interactive Blueprints**

The goal is to generate "living documentation" that is both descriptive and visually verifiable. By prompting for artifacts, you can:

  * **Generate and Render Diagrams:** Create Mermaid.js diagrams of your architecture and see them rendered instantly in a separate panel.
  * **Isolate and Test Code:** Ask for configuration files or code examples to be generated as distinct artifacts for immediate validation.
  * **Leverage Vision:** Feed Claude an existing diagram (e.g., a screenshot of a whiteboard) and have it generate the corresponding markdown documentation.

-----

### 📈 **Enhanced Prompt Templates**

### **1. `../../docs/TECHNICAL-ARCHITECTURE.md` (System Blueprint)**

This prompt is updated to request architecture diagrams as artifacts and to add a "diagram-to-docs" workflow using vision.

```
Generate technical architecture documentation for my [PROJECT_TYPE]. The document should serve as a detailed technical reference.

**GENERATE THE FOLLOWING ARTIFACTS:**
1.  A Mermaid.js diagram illustrating the high-level system architecture and component responsibilities.
2.  A sequence diagram (in Mermaid.js) showing the multi-agent coordination pattern.

PROJECT CONTEXT:
- Tech Stack: [TECH_STACK]
- Core Design Principle: [THEME] - [description]
- Target Audience: Technical leaders and enterprise architects.
- Key Design Problem: [what core technical problem this architecture solves]
- (Optional) Existing Diagram: [Provide a path or screenshot of an existing diagram to be documented]

DEVELOPMENT METRICS:
- Lines of AI-generated code: [estimate]
- Development timeframe: [X weeks]
- Key results: [quantified metrics like "75% API call reduction"]

DOCUMENT THE FOLLOWING SECTIONS IN MARKDOWN:

**System Architecture & Design**
- High-level architecture (embed the generated Mermaid diagram here).
- The multi-agent coordination pattern (embed the sequence diagram here).
- State management strategy and the rationale for its choice.
- Error handling, recovery, and resilience patterns.

**Data Integrity & Performance**
- Schema and validation strategy for structured AI responses.
- Batch processing implementation and measured efficiency gains.

**Security & Operations**
- Approach for managing development vs. production environments and secrets.
- Deployment strategy and scalability considerations.

**Key Technical Results**
- Performance benchmarks with before/after data.
- Development velocity measurements.

Include clear code examples that illustrate core patterns. The tone should be analytical and direct.
```

-----

### **2. `BUSINESS-IMPACT-ANALYSIS.md` (Connecting Tech to Value)**

This prompt now requests a visual artifact to make the data more compelling for its executive audience.

```
Create a "BUSINESS-IMPACT-ANALYSIS.md" file that connects the technical implementation of this [PROJECT_TYPE] to measurable business outcomes.

**GENERATE THE FOLLOWING ARTIFACT:**
- A markdown table summarizing the key metrics (e.g., Time-to-Delivery, Error Rate Reduction, Cost Savings) for easy embedding.

FOCUS ON CAUSE AND EFFECT IN THE MARKDOWN FILE:
Document the quantified results and explain how specific technical decisions produced them.

**Development Velocity & Efficiency**
- Time-to-delivery metrics and the technical factors that drove them.
- Resource efficiency gains from the development model.

**System Quality & Reliability**
- Error rate reduction percentages, tied to specific patterns (e.g., schema enforcement).
- Reliability metrics (e.g., uptime, successful transaction rates).

**Cost & Resource Analysis**
- Infrastructure cost optimizations with specific technical causes.
- How the architecture is designed to minimize technical debt.

**Strategic Implications**
- Competitive advantages enabled by the system's capabilities.
- ROI analysis based on development cost vs. operational savings.

Target: Executive teams and strategic decision-makers.
```

-----

### **3. `PRODUCTION-READINESS-REVIEW.md` (Operational Maturity)**

This is a prime candidate for artifacts, allowing you to visualize complex operational flows and provide ready-to-use configuration examples.

```
Create a "PRODUCTION-READINESS-REVIEW.md" file detailing the security, compliance, and operational capabilities of this [PROJECT_TYPE].

**GENERATE THE FOLLOWING ARTIFACTS:**
1.  A Mermaid.js diagram of the deployment architecture (e.g., multi-region, failover).
2.  A sequence diagram (in Mermaid.js) illustrating the CI/CD pipeline flow.
3.  A sample configuration file (e.g., `terraform.tfvars.example` or `docker-compose.yml`) demonstrating infrastructure-as-code principles.

FOCUS ON OPERATIONAL EXCELLENCE IN THE MARKDOWN FILE:

**Security & Compliance Architecture**
- Security boundaries between environments and data protection measures.
- Authentication and authorization patterns.
- Audit trail and monitoring systems for logging and review.

**Deployment & Infrastructure**
- The deployment architecture (embed the generated diagram).
- Container orchestration and auto-scaling strategy.
- Database replication, backup, and recovery procedures.

**Monitoring & Observability**
- The strategy for logging and metrics collection.
- Performance monitoring and alerting thresholds.
- Error tracking and automated recovery processes.

**Operational Patterns**
- Disaster recovery and business continuity plans.
- The use of infrastructure as code (IaC) for configuration management.
- The CI/CD pipeline for automated testing and deployment (embed the sequence diagram).

The document should demonstrate operational maturity suitable for large-scale use.
```

-----

### **4. `EXECUTIVE-BRIEFING.md` (Business Case)**

This prompt is enhanced to create a shareable summary table as a primary artifact for decision-makers.

```
Create an "EXECUTIVE-BRIEFING.md" file that presents a complete business case for the project.

**GENERATE THE FOLLOWING ARTIFACT:**
- A concise markdown table summarizing the ROI Analysis, including Development Cost, Operational Savings, and Projected Value.

STRUCTURE AS A BRIEFING FOR DECISION-MAKERS:

**Project Overview & Objectives**
- The business problem addressed and strategic objectives met.
- The resulting market position or competitive advantage.

**Technical Design Highlights**
- Core AI integration patterns and their function.
- Performance optimizations and their business impact (e.g., improved UX, lower cost).

**Quantified Business Impact**
- Development cost savings compared to traditional approaches.
- Time-to-market acceleration and its strategic value.
- How improved quality reduces ongoing support and maintenance costs.

**ROI Analysis**
- (Embed the summary table artifact here).
- Total cost of development vs. projected value and savings.
- Long-term strategic value.

**Recommendations**
- Investment priorities for building on this infrastructure.
- Team structure and skills needed to operate and scale.

Target: C-level executives and technical strategy teams.
```