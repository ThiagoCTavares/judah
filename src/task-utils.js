export const TASK_TIME_LABELS = {
  none: 'Sem horário',
  morning: 'Manhã',
  afternoon: 'Tarde',
  night: 'Noite',
  custom: 'Personalizado',
}

export const TASK_STATUS = {
  active: 'active',
  archived: 'archived',
}

const TIME_OPTION_ORDER = {
  custom: 0,
  morning: 1,
  afternoon: 2,
  night: 3,
  none: 4,
}

function padNumber(value) {
  return String(value).padStart(2, '0')
}

function compareTasksByTime(taskA, taskB) {
  const orderA = TIME_OPTION_ORDER[taskA.timeOption] ?? TIME_OPTION_ORDER.none
  const orderB = TIME_OPTION_ORDER[taskB.timeOption] ?? TIME_OPTION_ORDER.none

  if (orderA !== orderB) return orderA - orderB

  if (taskA.timeOption === 'custom' && taskB.timeOption === 'custom') {
    const startA = taskA.startTime || '99:99'
    const startB = taskB.startTime || '99:99'
    if (startA !== startB) return startA.localeCompare(startB)
  }

  const createdAtA = taskA.createdAt || ''
  const createdAtB = taskB.createdAt || ''
  if (createdAtA !== createdAtB) return createdAtA.localeCompare(createdAtB)

  return (taskA.id || '').localeCompare(taskB.id || '')
}

function parseTimeValue(timeValue) {
  if (typeof timeValue !== 'string') return null

  const [hoursRaw, minutesRaw] = timeValue.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null

  return { hours, minutes }
}

function createDateAtTime(dateKey, hours, minutes, seconds = 0, milliseconds = 0) {
  const [yearRaw, monthRaw, dayRaw] = String(dateKey || '').split('-')
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null

  const nextDate = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds)
  if (Number.isNaN(nextDate.getTime())) return null

  return nextDate
}

export function formatDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = padNumber(date.getMonth() + 1)
  const day = padNumber(date.getDate())

  return `${year}-${month}-${day}`
}

export function getTaskDisplayTime(task) {
  if (task?.timeOption === 'custom' && task.startTime) return task.startTime
  return TASK_TIME_LABELS[task?.timeOption] || TASK_TIME_LABELS.none
}

export function sortTasksByTime(tasks) {
  return [...tasks].sort(compareTasksByTime)
}

export function sortTasksByDateAndTime(tasks) {
  return [...tasks].sort((taskA, taskB) => {
    const dateKeyA = taskA?.dateKey || ''
    const dateKeyB = taskB?.dateKey || ''

    if (dateKeyA !== dateKeyB) return dateKeyA.localeCompare(dateKeyB)

    return compareTasksByTime(taskA, taskB)
  })
}

export function formatTaskDateLabel(dateKey) {
  if (typeof dateKey !== 'string') return ''

  const [year, month, day] = dateKey.split('-')
  if (!year || !month || !day) return ''

  return `${day}/${month}/${year}`
}

export function getTaskStatus(task) {
  return task?.status === TASK_STATUS.archived ? TASK_STATUS.archived : TASK_STATUS.active
}

export function filterTasksByStatus(tasks, status) {
  return tasks.filter((task) => getTaskStatus(task) === status)
}

export function getTaskDueDate(task) {
  if (!task?.dateKey) return null

  if (task.timeOption === 'morning') return createDateAtTime(task.dateKey, 12, 0)
  if (task.timeOption === 'afternoon') return createDateAtTime(task.dateKey, 18, 0)
  if (task.timeOption === 'night') return createDateAtTime(task.dateKey, 22, 0)
  if (task.timeOption === 'none') return createDateAtTime(task.dateKey, 23, 59, 59, 999)

  if (task.timeOption === 'custom') {
    const endTime = parseTimeValue(task.endTime)
    if (endTime) return createDateAtTime(task.dateKey, endTime.hours, endTime.minutes)

    const startTime = parseTimeValue(task.startTime)
    if (startTime) return createDateAtTime(task.dateKey, startTime.hours, startTime.minutes)

    return createDateAtTime(task.dateKey, 23, 59, 59, 999)
  }

  return createDateAtTime(task.dateKey, 23, 59, 59, 999)
}

export function isTaskOverdue(task, now = new Date()) {
  if (getTaskStatus(task) !== TASK_STATUS.active) return false

  const dueDate = getTaskDueDate(task)
  if (!dueDate) return false

  return dueDate.getTime() < now.getTime()
}

export function isTaskScheduleInFuture(task, now = new Date()) {
  const dueDate = getTaskDueDate(task)
  if (!dueDate) return false
  return dueDate.getTime() > now.getTime()
}

export function sortOverdueTasks(tasks, now = new Date()) {
  return sortTasksByDateAndTime(tasks.filter((task) => isTaskOverdue(task, now)))
}
