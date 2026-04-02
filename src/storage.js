const PROJECTS_STORAGE_KEY = 'judah:projects:v1'
const TASKS_STORAGE_KEY = 'judah:tasks:v1'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeProject(project) {
  if (!project || typeof project !== 'object') return null

  const name = typeof project.name === 'string' ? project.name.trim() : ''
  if (!name) return null

  return {
    id: typeof project.id === 'string' ? project.id : `project-${Date.now()}`,
    name,
    iconId: typeof project.iconId === 'string' && project.iconId ? project.iconId : 'Plus',
    color: typeof project.color === 'string' && project.color ? project.color : '#e0e0e0',
    details: typeof project.details === 'string' ? project.details.trim() : '',
  }
}

function normalizeTask(task) {
  if (!task || typeof task !== 'object') return null

  const name = typeof task.name === 'string' ? task.name.trim() : ''
  const dateKey = typeof task.dateKey === 'string' ? task.dateKey : ''
  if (!name || !dateKey) return null

  return {
    id: typeof task.id === 'string' ? task.id : `task-${Date.now()}`,
    name,
    dateKey,
    projectId: typeof task.projectId === 'string' && task.projectId ? task.projectId : null,
    timeOption: typeof task.timeOption === 'string' && task.timeOption ? task.timeOption : 'none',
    startTime: typeof task.startTime === 'string' ? task.startTime : '',
    endTime: typeof task.endTime === 'string' ? task.endTime : '',
    details: typeof task.details === 'string' ? task.details.trim() : '',
    createdAt: typeof task.createdAt === 'string' && task.createdAt ? task.createdAt : new Date().toISOString(),
    status: task.status === 'archived' ? 'archived' : 'active',
    completedAt: typeof task.completedAt === 'string' && task.completedAt ? task.completedAt : null,
  }
}

export function loadStoredProjects() {
  if (!canUseStorage()) return []

  try {
    const rawValue = window.localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!rawValue) return []

    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) return []

    return parsedValue.map(normalizeProject).filter(Boolean)
  } catch {
    return []
  }
}

export function saveStoredProjects(projects) {
  if (!canUseStorage()) return

  const normalizedProjects = Array.isArray(projects)
    ? projects.map(normalizeProject).filter(Boolean)
    : []

  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(normalizedProjects))
}

export function loadStoredTasks() {
  if (!canUseStorage()) return []

  try {
    const rawValue = window.localStorage.getItem(TASKS_STORAGE_KEY)
    if (!rawValue) return []

    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) return []

    return parsedValue.map(normalizeTask).filter(Boolean)
  } catch {
    return []
  }
}

export function saveStoredTasks(tasks) {
  if (!canUseStorage()) return

  const normalizedTasks = Array.isArray(tasks)
    ? tasks.map(normalizeTask).filter(Boolean)
    : []

  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(normalizedTasks))
}
