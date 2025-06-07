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

function formatSummary(tasks) {
  // Only main tasks (not subtasks) that are not done
  return tasks
    .filter(t => t.status !== 'done')
    .map(t => `- ${t.title} ${statusBox(t.status)}`)
    .join('\n');
}

function formatSubtasksDetailed(subtasks) {
  if (!subtasks || !subtasks.length) return '';
  return subtasks
    .filter(st => st.status !== 'done')
    .map(st => `  - ${statusBox(st.status)} ${st.title} — ${st.description}`)
    .join('\n');
}

function formatTaskDetailed(task) {
  let out = `### ${task.id}. ${task.title} ${statusBox(task.status)}`;
  out += `\n- ${task.description}`;
  out += `\n- _Priority: ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'N/A'}_`;
  out += `\n- _Dependencies: ${formatDependencies(task.dependencies)}_`;
  if (task.subtasks && task.subtasks.length) {
    const subtasks = task.subtasks.filter(st => st.status !== 'done');
    if (subtasks.length) {
      out += `\n- **Subtasks:**\n${formatSubtasksDetailed(subtasks)}`;
    } else {
      out += `\n- **All subtasks completed**`;
    }
  }
  return out;
}

function formatCompletedSubtasks(subtasks) {
  if (!subtasks || !subtasks.length) return '';
  const completed = subtasks.filter(st => st.status === 'done');
  if (!completed.length) return '';
  return completed.map(st => `  - [x] ${st.title} — ${st.description}`).join('\n');
}

function formatCompletedTask(task) {
  let out = `### ${task.id}. ${task.title} [x]`;
  out += `\n- ${task.description}`;
  out += `\n- _Priority: ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'N/A'}_`;
  out += `\n- _Dependencies: ${formatDependencies(task.dependencies)}_`;
  if (task.subtasks && task.subtasks.length) {
    const completed = task.subtasks.filter(st => st.status === 'done');
    if (completed.length) {
      out += `\n- **Completed Subtasks:**\n${formatCompletedSubtasks(completed)}`;
    }
  }
  return out;
}

function generateMarkdown(tasks) {
  const legend = `# Malk.tv Project Task List\n\nThis document provides a human-readable overview of all current tasks and subtasks for the Malk.tv Beta project, based on the latest tasks.json.\n\n---\n\n## Legend\n- **[ ]** Pending\n- **[x]** Done\n- **[~]** In Progress\n\n---`;

  // 1. Pending & In Progress Tasks (Summary)
  const summary = '\n\n## Pending & In Progress Tasks (Summary)\n\n' + formatSummary(tasks) + '\n';

  // 2. Pending & In Progress Tasks (Detailed)
  const pendingDetailed = '\n---\n\n## Pending & In Progress Tasks (Detailed)\n\n' +
    tasks
      .filter(t => t.status !== 'done')
      .map(formatTaskDetailed)
      .join('\n\n');

  // 3. Completed Tasks
  const completed = tasks.filter(t => t.status === 'done');
  let completedSection = '\n---\n\n## Completed Tasks\n';
  if (completed.length) {
    completedSection += '\n' + completed.map(formatCompletedTask).join('\n\n');
  }

  return legend + summary + pendingDetailed + completedSection + '\n';
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