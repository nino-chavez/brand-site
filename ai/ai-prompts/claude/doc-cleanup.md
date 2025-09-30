You are an expert software architect and code organization specialist. I need you to review and reorganize the file structure of this application according to industry best practices and framework-specific conventions.

## Your Task

1. **Analyze Current Structure**
   - Map out the entire project structure
   - Identify the framework/language (React, Node.js, Python, etc.)
   - Note any existing organizational patterns
   - Find misplaced files, orphaned documents, and inconsistencies

2. **Create Reorganization Plan**
   Before making any changes, provide a detailed plan that shows:
   - Current location → Proposed location for each file/folder
   - Rationale for each move
   - Any files that will be affected by reference updates
   - Confirmation that no documents will be orphaned

3. **Safety Requirements**
   CRITICAL: You must preserve all references and prevent orphaned files:
   - Search for ALL import/require statements that reference files being moved
   - Check for path references in: configuration files, package.json, tsconfig.json, webpack configs, etc.
   - Identify documentation cross-references (relative links in markdown, etc.)
   - Flag any asset references (images, fonts, etc. in CSS/HTML)
   - Never move a file without updating ALL references to it

4. **Best Practices to Apply**
   - Follow framework-specific conventions (e.g., Next.js app/ directory, Django project structure)
   - Group by feature/domain rather than file type when appropriate
   - Separate concerns: components, utilities, services, configs, tests
   - Co-locate related files (component + styles + tests)
   - Keep consistent naming conventions
   - Organize assets logically
   - Maintain clear public vs. internal boundaries

5. **Execution Steps**
   For each file move:
   a. Show the proposed change
   b. List all files with references that need updating
   c. Wait for my approval before proceeding
   d. Execute the move
   e. Update all references
   f. Verify nothing is broken

6. **Documentation**
   After reorganization, create/update:
   - PROJECT_STRUCTURE.md explaining the new organization
   - Any necessary .gitignore updates
   - Update main README if structure is documented there

## What NOT to do
- Don't move files without updating references
- Don't orphan any documentation files
- Don't break relative paths in markdown links
- Don't separate tightly coupled files (e.g., component and its styles)
- Don't make changes that would break the build

## Deliverables
1. Initial analysis report
2. Step-by-step reorganization plan (wait for approval)
3. Execute approved changes with reference updates
4. Final verification report
5. Updated documentation

Please start by analyzing the current project structure and identifying areas for improvement.