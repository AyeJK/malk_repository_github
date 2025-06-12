---
description: 
globs: 
alwaysApply: true
---
- **TASKS.md Synchronization**
  - Whenever `.taskmaster/tasks/tasks.json` is updated (tasks added, removed, or modified), update `TASKS.md` to reflect the current state of all tasks and subtasks.
  - The markdown file must:
    - Start with a summary list of all pending and in-progress main tasks at the top
    - Follow with a detailed section listing all pending and in-progress tasks and subtasks (with status, dependencies, and descriptions)
    - End with a section listing all completed tasks and subtasks
    - List all tasks and subtasks in a clear, human-readable hierarchy
    - Include task titles, descriptions, priorities, dependencies, and status (pending, in-progress, done, etc.)
    - Use checkboxes for status: `[ ]` for pending, `[~]` for in-progress, `[x]` for done
    - Include a legend for status symbols at the top
    - Be regenerated in full to avoid drift or partial updates
  - Example update triggers:
    - Task status changes (e.g., pending → done)
    - New tasks or subtasks are added
    - Task details, dependencies, or priorities are modified
  - **Automation:**
    - Use the script `scripts/generate-tasks-md.js` to regenerate `TASKS.md` from `.taskmaster/tasks/tasks.json`.
    - Run with: `node scripts/generate-tasks-md.js`
    - This script must output the new format:
      1. Pending & In Progress Tasks (Summary)
      2. Pending & In Progress Tasks (Detailed)
      3. Completed Tasks (with completed subtasks)
    - The legend and checkboxes must always be present at the top.
    - **Always run this script after any change to `tasks.json` to keep `TASKS.md` in sync.**

- **Up-to-Date Task Report on Request**
  - When the user says "show me what's next", generate and display a current task report based on the latest `tasks.json`.
  - The report must:
    - List the next actionable task(s) according to dependencies, status, and priority
    - Include relevant subtasks if the next task is a parent
    - Show status, dependencies, and a brief description for each next task
    - Be accurate to the current state of `tasks.json` and `TASKS.md`
  - Example output:
    ```
    ## Next Task
    4. Video Posting System [ ]
       - Implement the core functionality for curators to post videos from various platforms.
       - Priority: High
       - Dependencies: 2 (done)
       - Subtasks:
         1. URL Validation and Parsing [ ]
         2. Metadata Fetching Service [ ]
         ...
    ```

- **Best Practices**
  - Automate the update of `TASKS.md` as part of any workflow that changes `tasks.json`
  - Ensure the user always has a single source of truth for project status
  - If a manual update is required, remind the user to regenerate `TASKS.md` after editing `tasks.json`
