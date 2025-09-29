Prompt for AI Subagent Refactoring and Creation

  Objective:

  Your goal is to standardize and improve the subagent definitions in this project. This involves two main activities:

   1. Refactoring an existing "programmatic" subagent to a more flexible "prompt-based" standard.
   2. Creating a new FileOrganizerAgent subagent based on the lessons learned from a recent file reorganization task.

  The final state should be a clean, consistent, and well-documented set of subagents.

  Phase 1: Inventory and Standardization

   1. Inventory Existing Subagents:
       * Locate the directory where subagents are defined (e.g., ai/subagents/).
       * List all existing subagents and their implementation files (e.g., instruction files, configuration files, scripts).
       * Identify any subagents that are implemented programmatically (i.e., with scripts and complex JSON configurations) as candidates for refactoring.

   2. Define the Standard:
       * The standard for all subagents in this project is the "prompt-based" approach.
       * Each subagent must be defined by a single Markdown instruction file that contains a clear, comprehensive, natural language prompt for the agent to follow.
       * A central subagent-config.json file must be used to register all available subagents with a name, description, and a path to their instruction file.

  Phase 2: Subagent Refactoring (The "Cleanup")

  For each existing subagent that does not follow the prompt-based standard:

   1. Analyze the Existing Implementation:
       * Read the subagent's instruction files (.md), configuration files (.json), and any associated scripts (.js, .cjs, etc.).
       * Identify the core logic, rules, and guidelines that the subagent is designed to enforce.

   2. Translate Logic to a Prompt:
       * Rewrite the programmatic rules and logic as a clear, comprehensive, natural language prompt. This prompt will become the new instruction file for the subagent.
       * Incorporate any examples, explanations, and "emergency protocols" from the old documentation into the new prompt.

   3. Create the New Instruction File:
       * Create a new Markdown file for the refactored subagent (e.g., CodeGuardianAgent.md).
       * Write the prompt you created in the previous step to this file.

   4. Deprecate Old Files:
       * Remove the old, now-redundant implementation files (scripts, old config files, etc.).

  Phase 3: New Subagent Creation (The "FileOrganizerAgent")

   1. Codify the File Organization Task:
       * Create a new subagent named FileOrganizerAgent.
       * Write a detailed, step-by-step prompt for this subagent that codifies the process of safely reorganizing a project's file structure.
       * Crucially, this prompt must include the following guardrails:
           * A requirement to present a plan for approval before making changes.
           * A requirement to work in small, iterative batches.
           * A requirement to run the project's build after each batch of file moves and to fix any build errors before proceeding.
           * A requirement to search for and fix any broken links or references in all file types (including Markdown) after moving files.
           * A requirement to run the full test suite after the reorganization is complete.

   2. Create the New Instruction File:
       * Create a new Markdown file for the new subagent (FileOrganizerAgent.md).
       * Write the prompt you created in the previous step to this file.

  Phase 4: Configuration and Documentation

   1. Update Subagent Configuration:
       * Update the central subagent-config.json file to reflect all the changes you've made.
       * Ensure that all refactored and newly created subagents are correctly registered with a name, description, and a path to their instruction file.

   2. Update Project Documentation (Guardrail):
       * Perform a project-wide search for any references to the old, refactored subagents.
       * Update these references to point to the new subagent names and instruction files.
       * Search the project documentation (especially AGENTS.md or similar) for any opportunities to mention the new subagents you've created, and update the documentation 
         accordingly.

  Final Review:

   * Provide a summary of the refactoring and creation work you've done.
   * Confirm that the subagent definitions are now standardized and that all project documentation is up to date.