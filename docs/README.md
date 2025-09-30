# Documentation Guide

This directory contains documentation for multiple audiences. Navigate to the appropriate section based on your needs.

## 📚 Documentation Structure

### 🎯 [showcase/](./showcase/) - For End Users & Potential Clients

**Purpose:** Portfolio pieces demonstrating AI-assisted development capabilities

Professional showcase documentation highlighting the sophisticated human-AI collaboration methodology used to build this portfolio. These documents serve as demonstrations of technical thinking and AI partnership patterns.

**Contents:**
- AI collaboration methodology and patterns
- Advanced prompting strategies
- Technical architecture showcase
- Development workflow transparency
- Enterprise-grade decision rationale

**Future:** This directory will become a Docusaurus documentation site for public consumption.

---

### 👨‍💻 [developer/](./developer/) - For Repository Contributors

**Purpose:** Technical reference for developers working on this codebase

Internal documentation covering project structure, development standards, deployment procedures, and technical guides. Essential reading for anyone contributing to the repository.

**Contents:**
- Project structure and organization
- Code quality standards
- Deployment guides and checklists
- Performance optimization techniques
- Accessibility implementation patterns
- Monitoring and analytics setup

---

### 🧩 [components/](./components/) - API & Component Reference

**Purpose:** Technical documentation for reusable components and systems

Component-level documentation serving both end users (showcasing implementation quality) and developers (API reference). Covers the photography-metaphor-driven design system and specialized UI components.

**Contents:**
- Viewfinder hero interface system
- Athletic design token system
- Canvas utilities API
- Lightbox canvas API
- Photography metaphor design language
- Cinematic timing and easing specifications

---

### 📦 [archive/](./archive/) - Historical Documents

**Purpose:** Completed phases, superseded specifications, and historical assessments

Documents from completed development phases that provide historical context but are no longer actively maintained. Useful for understanding project evolution and past architectural decisions.

**Contents:**
- Original project specification
- Development phase documentation
- Phase 2 transition guardrails
- Historical project status assessments
- Legacy deployment guides

---

### 🤖 [prompts/](./prompts/) - AI Prompt Templates

**Purpose:** Utility prompts for AI-assisted documentation generation

Prompt templates used for maintaining documentation consistency and quality through AI assistance.

---

## Quick Links

### Getting Started
- [Project Structure](./developer/project-structure.md) - Understand the codebase organization
- [Code Quality Standards](./developer/code-quality.md) - Development best practices

### Deployment
- [Deployment Checklist](./developer/deployment/deployment-checklist-rollback.md)
- [Production Build Guide](./developer/deployment/production-build-guide.md)

### Component APIs
- [Viewfinder System](./components/viewfinder-system.md)
- [Athletic Design Tokens](./components/athletic-tokens.md)
- [Lightbox Canvas API](./components/api/lightbox-canvas-api.md)

### AI Development Showcase
- [AI Collaboration Patterns](./showcase/ai-collaboration.md)
- [Technical Architecture](./showcase/technical-architecture.md)
- [AI Development Showcase](./showcase/ai-development-showcase.md)

---

## Documentation Standards

### Audience Clarity
Each document should clearly indicate its intended audience in the frontmatter or introduction.

### Maintenance Status
Active documentation (showcase/, developer/, components/) is maintained with each feature change. Archive documentation is preserved for historical reference only.

### Cross-References
When linking between documents, use relative paths from the docs/ root for portability.

### Docusaurus Readiness
The showcase/ directory follows Docusaurus-compatible markdown conventions for future migration to a public documentation site.