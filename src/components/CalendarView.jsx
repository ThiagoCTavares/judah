import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ListChecks, Plus } from '@phosphor-icons/react'
import { WEEKDAYS, getProjectIconById } from '../constants'
import { formatDateKey, getTaskDisplayTime } from '../task-utils'
import { TaskDetailsSheet } from './TaskDetailsSheet'

export function CalendarView({ cells, monthLabel, today, selectedDate, onSelectDate, selectedDateInfo, onOpenTaskModal, tasks, allTasks, overdueDateKeys, projects, onDeleteTask, onResolveOverdueDone, onResolveOverdueKeep, onTaskSheetVisibilityChange }) {
  const borderColor = 'var(--judah-light)'
  const headerColor = 'var(--judah-black)'
  const dayColor = 'var(--judah-dark)'
  const activeDayBg = 'var(--judah-dark)'
  const MotionDiv = motion.div
  const [taskSelection, setTaskSelection] = useState({ dateKey: '', taskId: null })

  const projectsById = new Map(projects.map((project) => [project.id, project]))
  const tasksByDateKey = allTasks.reduce((accumulator, task) => {
    if (!accumulator.has(task.dateKey)) accumulator.set(task.dateKey, [])
    accumulator.get(task.dateKey).push(task)
    return accumulator
  }, new Map())

  const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate])

  const selectedTask = useMemo(() => {
    if (!taskSelection.taskId || taskSelection.dateKey !== selectedDateKey) return null
    return tasks.find((task) => task.id === taskSelection.taskId) || null
  }, [selectedDateKey, taskSelection, tasks])

  useEffect(() => {
    onTaskSheetVisibilityChange?.(Boolean(selectedTask))
  }, [onTaskSheetVisibilityChange, selectedTask])

  useEffect(() => {
    return () => {
      onTaskSheetVisibilityChange?.(false)
    }
  }, [onTaskSheetVisibilityChange])

  const handleDayClick = (day) => {
    if (!day) return
    const newDate = new Date(today.getFullYear(), today.getMonth(), day)
    onSelectDate(newDate)
  }

  const handleSelectTask = (taskId) => {
    setTaskSelection({ dateKey: selectedDateKey, taskId })
  }

  const handleCloseTaskSheet = () => {
    setTaskSelection({ dateKey: selectedDateKey, taskId: null })
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '60px var(--app-horizontal-padding) 0 var(--app-horizontal-padding)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ fontSize: '1.25rem', color: 'var(--judah-black)', fontWeight: 400, letterSpacing: '-0.025em' }}>{monthLabel}</div>
      </div>

      <div style={{ width: '100%', borderTop: `1px solid ${borderColor}`, borderLeft: `1px solid ${borderColor}`, backgroundColor: 'var(--judah-white)' }}>
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((day, i) => (
            <div key={i} style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: headerColor, borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[minmax(60px,1fr)]">
          {cells.map((day, index) => {
            let cellDate = null
            if (day) cellDate = new Date(today.getFullYear(), today.getMonth(), day)
            const isToday = cellDate && isSameDay(cellDate, today)
            const isSelected = cellDate && isSameDay(cellDate, selectedDate)
            const dateKey = cellDate ? formatDateKey(cellDate) : ''
            const taskDots = dateKey ? (tasksByDateKey.get(dateKey) || []) : []
            const hasOverdueTask = dateKey ? overdueDateKeys.has(dateKey) : false
            const cellBackgroundColor = hasOverdueTask
              ? (isSelected ? 'rgba(220,38,38,0.16)' : 'rgba(220,38,38,0.1)')
              : (isSelected ? 'rgba(0,0,0,0.03)' : 'transparent')
            const currentDayBackground = isToday
              ? (hasOverdueTask ? '#dc2626' : activeDayBg)
              : 'transparent'
            const currentDayColor = isToday
              ? 'var(--judah-pure)'
              : (hasOverdueTask ? '#b91c1c' : dayColor)
            return (
              <div key={index} onClick={() => handleDayClick(day)} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px', minHeight: '80px', borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, cursor: day ? 'pointer' : 'default', backgroundColor: cellBackgroundColor }}>
                {day ? (
                  <>
                    <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: currentDayBackground, color: currentDayColor, fontWeight: isToday ? 500 : 400, fontSize: '0.875rem' }}>{day}</span>
                    {taskDots.length > 0 && (
                      <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '100%', padding: '0 6px' }}>
                        {taskDots.slice(0, 4).map((task) => {
                          const project = task.projectId ? projectsById.get(task.projectId) : null
                          return (
                            <span
                              key={task.id}
                              title={task.name}
                              style={{ width: '6px', height: '6px', flexShrink: 0, borderRadius: '50%', backgroundColor: project?.color || 'var(--judah-dark)' }}
                            />
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : <span />}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--judah-medium)', fontWeight: 400 }}>{isSameDay(selectedDate, today) ? 'Hoje é' : 'Visualizando'}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', color: 'var(--judah-black)', fontWeight: 500, letterSpacing: '-0.025em' }}>{selectedDateInfo.weekday},</span>
            <span style={{ fontSize: '2rem', color: 'var(--judah-black)', fontWeight: 500, letterSpacing: '-0.025em' }}>{selectedDateInfo.dayNum}</span>
          </div>
        </div>
        <button onClick={onOpenTaskModal} style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--judah-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginBottom: '4px', border: 'none' }}><Plus color="#ffffff" size={24} weight="bold" /></button>
      </div>

      {tasks.length > 0 ? (
        <div style={{ marginTop: '24px', display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '20px', maskImage: 'linear-gradient(to right, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)' }}>
          {tasks.map((task) => {
            const project = task.projectId ? projectsById.get(task.projectId) : null
            const TaskIcon = project ? getProjectIconById(project.iconId) : ListChecks
            const taskColor = project?.color || 'var(--judah-dark)'
            const isTaskSelected = task.id === selectedTask?.id

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => handleSelectTask(task.id)}
                aria-pressed={isTaskSelected}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <div title={task.name} style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: taskColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isTaskSelected ? '0 0 0 2px rgba(18,18,18,0.12), 0 4px 12px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.1)', transform: isTaskSelected ? 'translateY(-1px)' : 'none', transition: 'box-shadow 160ms ease, transform 160ms ease' }}>
                  <TaskIcon color="#ffffff" size={20} weight="regular" />
                </div>
                <span style={{ fontSize: '0.875rem', color: isTaskSelected ? 'var(--judah-black)' : '#363636', fontWeight: isTaskSelected ? 600 : 500 }}>{getTaskDisplayTime(task)}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p style={{ marginTop: '24px', marginBottom: 0, fontSize: '0.95rem', color: 'var(--judah-medium)' }}>
          Nenhuma task para este dia.
        </p>
      )}

      <AnimatePresence>
        {selectedTask && (
          <TaskDetailsSheet
            key={selectedTask.id}
            task={selectedTask}
            projects={projects}
            onClose={handleCloseTaskSheet}
            onDeleteTask={onDeleteTask}
            onResolveOverdueDone={onResolveOverdueDone}
            onResolveOverdueKeep={onResolveOverdueKeep}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
