Objective:

  Your primary goal is to reorganize the file structure of this project to align with industry best practices and the conventions of the existing tech stack. The final state 
  of the project must be clean, organized, and fully functional, with no broken builds, tests, or internal links.

  Phase 1: Analysis and Planning

   1. Analyze the Project Structure:
       * Identify the project's tech stack (frameworks, languages, build tools) by inspecting files like package.json, vite.config.ts, etc.
       * List all files and directories in the project root to get a complete overview.
       * Categorize all files and directories (e.g., source code, documentation, configuration, assets, AI-related files, etc.).

   2. Propose a Reorganization Plan:
       * Based on your analysis, create a detailed, step-by-step plan for reorganizing the project.
       * The plan must specify which files and directories will be moved, removed, or created.
       * Present the plan for approval before making any changes.
       * Crucial: Explicitly ask for any specific files or directories that must not be moved, even if they seem to contradict standard conventions (e.g., AGENTS.md in the 
         root).

  Phase 2: Execution and Verification

  Once the plan is approved, execute it in an iterative and safe manner. Do not proceed to the next step until the current one is fully verified.

   1. Execute in Batches:
       * Perform the file and directory moves in small, logical batches (e.g., move all source files, then all documentation files).

   2. Verify Source Code Integrity (Guardrail 1 - The Build):
       * Immediately after each batch of file moves, run the project's build command (e.g., npm run build, vite build).
       * If the build fails, you must stop, identify the root cause (it will likely be broken import paths in the files you just moved or files that reference them), and fix 
         it.
       * Do not move on to the next batch of files until the build is successful. This is a critical checkpoint.

   3. Verify Reference Integrity (Guardrail 2 - The Links):
       * After moving a batch of files (especially documentation), perform a project-wide search for any references to the old file paths.
       * This search must include all file types, not just source code. Pay close attention to links in Markdown files (.md), paths in configuration files, and any other 
         potential plain-text references.
       * Update all found references to point to the new file locations.

   4. Verify with Testing (Guardrail 3 - The Tests):
       * After all files have been moved and all references have been updated, run the project's full test suite (e.g., npm test, vitest).
       * Ensure that all tests pass before considering the task complete.

  Final Review:

   * Provide a summary of the changes made.
   * Confirm that the project is in a clean, organized, and fully functional state, with a successful build and all tests passing.