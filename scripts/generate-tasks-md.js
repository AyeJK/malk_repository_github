#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const TASKS_JSON = path.join(__dirname, '../.taskmaster/tasks/tasks.json');
const TASKS_MD = path.join(__dirname, '../TASKS.md');

function statusBox(status) {
  if (status === 'done') return '[x]';
  if (status === 'in-progress') return '[~]';
  return '[ ]';
}

function formatDependencies(deps) {
  if (!deps || !deps.length) return 'None';
  return deps.join(', ');
}

function groupSubtasks(subtasks) {
  const groups = { 'Next Up': [], 'In Progress': [], 'Completed': [] };
  for (const st of subtasks) {
    if (st.status === 'done') groups['Completed'].push(st);
    else if (st.status === 'in-progress') groups['In Progress'].push(st);
    else groups['Next Up'].push(st);
  }
  return groups;
}

function formatSubtasks(subtasks) {
  if (!subtasks || !subtasks.length) return '';
  const groups = groupSubtasks(subtasks);
  let out = '   - **Subtasks:**\n';
  for (const group of ['Next Up', 'In Progress', 'Completed']) {
    if (groups[group].length) {
      out += `     - **${group}:**\n`;
      for (const st of groups[group]) {
        out += `       ${st.id}. ${st.title} ${statusBox(st.status)} — ${st.description}\n`;
      }
    }
  }
  return out;
}

function formatTask(task, idx) {
  let out = `${task.id}. **${task.title}** ${statusBox(task.status)}\n`;
  out += `   - ${task.description}\n`;
  out += `   - _Priority: ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'N/A'}_\n`;
  out += `   - _Dependencies: ${formatDependencies(task.dependencies)}_\n`;
  if (task.subtasks && task.subtasks.length) {
    out += formatSubtasks(task.subtasks);
  }
  return out;
}

function generateMarkdown(tasks) {
  const legend = `# Malk.tv Project Task List\n\nThis document provides a human-readable overview of all current tasks and subtasks for the Malk.tv Beta project, based on the latest tasks.json.\n\n---\n\n## Legend\n- **[ ]** Pending\n- **[x]** Done\n- **[~]** In Progress\n\n---\n`;
  let md = legend + '\n## Tasks\n\n';
  const active = [];
  const completed = [];
  for (const task of tasks) {
    if (task.status === 'done') completed.push(task);
    else active.push(task);
  }
  // Only show active (pending/in-progress) tasks at the top
  for (const task of active) {
    md += formatTask(task) + '\n';
  }
  // Completed section
  if (completed.length) {
    md += '\n### Completed\n\n';
    for (const task of completed) {
      md += formatTask(task) + '\n';
    }
  }
  return md;
}

function main() {
  const raw = fs.readFileSync(TASKS_JSON, 'utf8');
  const data = JSON.parse(raw);
  const tasks = data.tasks;
  const md = generateMarkdown(tasks);
  fs.writeFileSync(TASKS_MD, md, 'utf8');
  console.log('TASKS.md regenerated from tasks.json!');
}

main(); 