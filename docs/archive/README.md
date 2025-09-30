# Documentation Archive

This directory contains historical documentation from completed development phases and superseded specifications.

## Archive Purpose

These documents are preserved for:
- Historical context and project evolution understanding
- Tracking architectural decision progression
- Learning from past approaches and assessments
- Maintaining complete project history

**Note:** Archive documents are NOT actively maintained. For current documentation, see the parent docs/ directory.

---

## Contents

### Original Specifications

**`project-specification.md`**
- **Date:** Project inception
- **Status:** Superseded by `.agent-os/product/roadmap.md`
- **Purpose:** Original project vision and requirements
- **Historical Value:** Shows initial scope and how it evolved

---

### Completed Phase Documentation

**`development-phases.md`**
- **Date:** Multi-phase project timeline
- **Status:** Phases 1-2 completed, documented in `.agent-os/recaps/`
- **Purpose:** Historical overview of phased development approach
- **Historical Value:** Documents the "The Lens & Lightbox" strategic vision execution

**`phase2-transition-guardrails.md`**
- **Date:** Phase 2 implementation period
- **Status:** Phase 2 completed September 2025
- **Purpose:** Guardrails for transitioning from scroll to canvas navigation
- **Historical Value:** Shows architectural transformation considerations

---

### Historical Assessments

**`project-status/` directory**
- **Date:** September 29, 2025
- **Status:** Superseded by project reorganization (September 30)
- **Purpose:** Point-in-time health and gap analysis
- **Files:**
  - `APPLICATION-HEALTH-ASSESSMENT.md` - Build and infrastructure status
  - `COMPREHENSIVE-GAP-ANALYSIS.md` - Implementation vs roadmap gaps
  - `CONTENT-ADAPTER-RECOVERY-ASSESSMENT.md` - Content adapter analysis
  - `TEST-DEPRECATION-STRATEGY.md` - Test cleanup planning

**Historical Context:** These assessments identified issues that were subsequently resolved through the comprehensive project structure reorganization completed September 30.

---

### Legacy Deployment Documentation

**`deployment-guide-viewfinder.md`**
- **Date:** Viewfinder system implementation phase
- **Status:** Superseded by `docs/developer/deployment/`
- **Purpose:** Original Viewfinder-specific deployment guide
- **Historical Value:** Shows component-level deployment thinking before system-wide guides

**Current Deployment Docs:** See `docs/developer/deployment/` for active deployment procedures.

---

## Migration Notes

Documents were moved to archive on **2025-09-30** during documentation reorganization that separated:
- Showcase documentation (for end users)
- Developer documentation (for contributors)
- Component documentation (for API reference)
- Historical documentation (this archive)

---

## Cross-References

### Active Replacements

| Archived Document | Current Active Version |
|-------------------|------------------------|
| `project-specification.md` | `.agent-os/product/roadmap.md` |
| `development-phases.md` | `.agent-os/recaps/` + `.agent-os/product/recaps/` |
| `project-status/*.md` | `docs/developer/project-structure.md` |
| `deployment-guide-viewfinder.md` | `docs/developer/deployment/` |

---

## Preservation Policy

Archive documents are:
- ✅ Preserved with full git history
- ✅ Available for historical reference
- ❌ NOT updated with current information
- ❌ NOT cross-referenced in active documentation

When citing archived documents, always note their historical nature and reference the current active version if applicable.