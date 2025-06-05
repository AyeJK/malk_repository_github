---
description: 
globs: 
alwaysApply: true
---
# Chat Summaries

- **Save Chat Summaries When Requested**
  - When the user says "Save Summary", create a markdown file summarizing the conversation
  - Save files in the `chat summaries/` directory with a descriptive name related to the topic
  - Include date and time at the top of each summary

- **Standard Summary Format**
  ```markdown
  # Chat Summary: [Topic Title]
  *Date: [Current Date]*  
  *Time: [Current Time]*

  In this session, we addressed:

  1. **[Main Point 1]**:
     - [Detail]
     - [Detail]

  2. **[Main Point 2]**:
     - [Detail]
     - [Detail]

  ## Remaining Issues / Next Steps
  
  [List any unresolved issues or follow-up tasks]
  ```

- **Summary Content Requirements**
  - **Start with clear title** that describes the session focus
  - **Organize content into numbered sections** with bold headings
  - **Use bullet points** for specific details under each section
  - **Include code examples** where relevant
  - **Document any errors or issues** that weren't resolved
  - **List next steps** or follow-up items for future sessions

- **Workflow for Creating Summaries**
  - When user says "Save Summary", review the chat to identify key topics
  - Create an organized structure capturing main points
  - Save to `chat summaries/[descriptive-name].md`
  - Confirm to the user that the summary was saved

- **Naming Conventions**
  - Use kebab-case for filenames: `topic-area-changes.md`
  - Include date in filename for multiple summaries on same topic: `airtable-config-may19.md`

