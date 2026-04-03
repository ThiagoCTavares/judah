import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, PuzzlePiece } from '@phosphor-icons/react'
import { NewTaskModal } from './components/NewTaskModal'
import { CalendarView } from './components/CalendarView'
import { ProjectsView } from './components/ProjectsView'
import { OverdueTaskModal } from './components/OverdueTaskModal'
import { RescheduleTaskModal } from './components/RescheduleTaskModal'
import { MONTH_NAMES, WEEKDAYS_FULL } from './constants'
import { loadStoredProjects, loadStoredTasks, saveStoredProjects, saveStoredTasks } from './storage'
import { TASK_STATUS, filterTasksByStatus, formatDateKey, sortOverdueTasks, sortTasksByTime } from './task-utils'

const MotionDiv = motion.div

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isCalendarTaskSheetOpen, setIsCalendarTaskSheetOpen] = useState(false)
  const [isProjectTaskSheetOpen, setIsProjectTaskSheetOpen] = useState(false)
  const [projects, setProjects] = useState(() => loadStoredProjects())
  const [initialTasks] = useState(() => loadStoredTasks())
  const [tasks, setTasks] = useState(() => initialTasks)
  const [overdueQueueIds, setOverdueQueueIds] = useState(() => (
    sortOverdueTasks(
      filterTasksByStatus(initialTasks, TASK_STATUS.active),
      new Date()
    ).map((task) => task.id)
  ))
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

  const today = useMemo(() => new Date(), [])
  const mainRef = useRef(null)

  const handleScroll = (event) => {
    const width = window.innerWidth
    const index = Math.round(event.target.scrollLeft / width)
    if (index !== activeIndex) setActiveIndex(index)
  }

  const goTo = (index) => {
    if (!mainRef.current) return
    const width = window.innerWidth
    mainRef.current.scrollTo({ left: index * width, behavior: 'smooth' })
  }

  const { calendarCells, monthLabel } = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstWeekday = new Date(year, month, 1).getDay()
    const usedSlots = firstWeekday + daysInMonth
    const rows = Math.ceil(usedSlots / 7)
    const totalSlots = rows * 7
    const cells = Array.from({ length: totalSlots }, (_, index) => {
      const dayNumber = index - firstWeekday + 1
      if (index < firstWeekday || dayNumber > daysInMonth) return null
      return dayNumber
    })
    return { calendarCells: cells, monthLabel: MONTH_NAMES[month] }
  }, [selectedDate])

  const selectedDateInfo = useMemo(() => {
    const weekday = WEEKDAYS_FULL[selectedDate.getDay()]
    const dayNum = selectedDate.getDate()
    return { weekday, dayNum }
  }, [selectedDate])

  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate])
  const activeTasks = useMemo(() => filterTasksByStatus(tasks, TASK_STATUS.active), [tasks])
  const archivedTasks = useMemo(() => filterTasksByStatus(tasks, TASK_STATUS.archived), [tasks])
  const overdueActiveTasks = useMemo(() => sortOverdueTasks(activeTasks, new Date()), [activeTasks])
  const overdueDateKeys = useMemo(() => new Set(overdueActiveTasks.map((task) => task.dateKey)), [overdueActiveTasks])
  const overdueProjectIds = useMemo(
    () => new Set(overdueActiveTasks.map((task) => task.projectId).filter(Boolean)),
    [overdueActiveTasks]
  )
  const visibleOverdueQueueIds = useMemo(() => {
    const activeTaskIds = new Set(activeTasks.map((task) => task.id))
    return overdueQueueIds.filter((taskId) => activeTaskIds.has(taskId))
  }, [activeTasks, overdueQueueIds])

  const tasksForSelectedDate = useMemo(() => {
    return sortTasksByTime(activeTasks.filter((task) => task.dateKey === selectedDateKey))
  }, [activeTasks, selectedDateKey])

  const currentOverdueTask = useMemo(() => {
    const currentTaskId = visibleOverdueQueueIds[0]
    if (!currentTaskId) return null
    return activeTasks.find((task) => task.id === currentTaskId) || null
  }, [activeTasks, visibleOverdueQueueIds])
  const isBottomNavVisible = !isCalendarTaskSheetOpen && !isProjectTaskSheetOpen

  const navItems = [
    { id: 0, icon: <Calendar color="var(--judah-black)" size={24} weight="regular" />, label: 'Calendario' },
    { id: 1, icon: <PuzzlePiece color="var(--judah-black)" size={24} weight="regular" />, label: 'Projetos' },
  ]

  useEffect(() => {
    saveStoredProjects(projects)
  }, [projects])

  useEffect(() => {
    saveStoredTasks(tasks)
  }, [tasks])

  const handleSaveTask = (newTask) => {
    setTasks((currentTasks) => [...currentTasks, newTask])
    setIsTaskModalOpen(false)
  }

  const handleUpdateTask = (taskId, nextValues) => {
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === taskId ? { ...task, ...nextValues } : task
    )))
  }

  const handleDeleteTask = (taskId) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
    setOverdueQueueIds((currentQueueIds) => currentQueueIds.filter((currentTaskId) => currentTaskId !== taskId))
  }

  const handleDeleteProject = (projectId) => {
    setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId))
    setTasks((currentTasks) => {
      const removedTaskIds = new Set(
        currentTasks
          .filter((task) => task.projectId === projectId)
          .map((task) => task.id)
      )

      if (removedTaskIds.size > 0) {
        setOverdueQueueIds((currentQueueIds) => currentQueueIds.filter((taskId) => !removedTaskIds.has(taskId)))
      }

      return currentTasks.filter((task) => task.projectId !== projectId)
    })
  }

  const handleRemoveFromOverdueQueue = (taskId) => {
    setOverdueQueueIds((currentQueueIds) => currentQueueIds.filter((currentTaskId) => currentTaskId !== taskId))
  }

  const handleArchiveTaskAsDone = (taskId) => {
    if (!taskId) return
    handleUpdateTask(taskId, {
      status: TASK_STATUS.archived,
      completedAt: new Date().toISOString(),
    })
    handleRemoveFromOverdueQueue(taskId)
  }

  const handleArchiveOverdueTask = () => {
    if (!currentOverdueTask) return
    handleArchiveTaskAsDone(currentOverdueTask.id)
  }

  const handleKeepTaskOverdue = (taskId) => {
    if (!taskId) return
    handleRemoveFromOverdueQueue(taskId)
  }

  const handleKeepOverdueTask = () => {
    if (!currentOverdueTask) return
    handleKeepTaskOverdue(currentOverdueTask.id)
  }

  const handleOpenRescheduleModal = () => {
    setIsRescheduleModalOpen(true)
  }

  const handleCancelReschedule = () => {
    setIsRescheduleModalOpen(false)
  }

  const handleSaveReschedule = (nextValues) => {
    if (!currentOverdueTask) return

    handleUpdateTask(currentOverdueTask.id, {
      ...nextValues,
      status: TASK_STATUS.active,
      completedAt: null,
    })
    setIsRescheduleModalOpen(false)
    handleRemoveFromOverdueQueue(currentOverdueTask.id)
  }

  const handleChangeCalendarMonth = (nextMonth) => {
    setSelectedDate((currentDate) => {
      const currentYear = currentDate.getFullYear()
      const currentDay = currentDate.getDate()
      const lastDayOfTargetMonth = new Date(currentYear, nextMonth + 1, 0).getDate()
      const nextDay = Math.min(currentDay, lastDayOfTargetMonth)
      return new Date(currentYear, nextMonth, nextDay)
    })
  }

  return (
    <div className="app-root">
      <AnimatePresence>
        {isTaskModalOpen && (
          <NewTaskModal
            onClose={() => setIsTaskModalOpen(false)}
            onSaveTask={handleSaveTask}
            projects={projects}
            selectedDate={selectedDate}
          />
        )}

        {currentOverdueTask && !isRescheduleModalOpen && (
          <OverdueTaskModal
            key={`overdue-${currentOverdueTask.id}`}
            task={currentOverdueTask}
            projects={projects}
            remainingCount={visibleOverdueQueueIds.length}
            onMarkDone={handleArchiveOverdueTask}
            onReschedule={handleOpenRescheduleModal}
            onKeep={handleKeepOverdueTask}
          />
        )}

        {currentOverdueTask && isRescheduleModalOpen && (
          <RescheduleTaskModal
            key={`reschedule-${currentOverdueTask.id}`}
            task={currentOverdueTask}
            onCancel={handleCancelReschedule}
            onSave={handleSaveReschedule}
          />
        )}
      </AnimatePresence>

      <main ref={mainRef} onScroll={handleScroll} className="app-shell">
        <section className="app-panel snap-center">
          <CalendarView
            cells={calendarCells}
            monthLabel={monthLabel}
            today={today}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onChangeMonth={handleChangeCalendarMonth}
            selectedDateInfo={selectedDateInfo}
            onOpenTaskModal={() => setIsTaskModalOpen(true)}
            tasks={tasksForSelectedDate}
            allTasks={activeTasks}
            overdueDateKeys={overdueDateKeys}
            projects={projects}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onResolveOverdueDone={handleArchiveTaskAsDone}
            onResolveOverdueKeep={handleKeepTaskOverdue}
            onTaskSheetVisibilityChange={setIsCalendarTaskSheetOpen}
          />
        </section>

        <section className="app-panel snap-center">
          <ProjectsView
            projects={projects}
            setProjects={setProjects}
            activeTasks={activeTasks}
            archivedTasks={archivedTasks}
            overdueProjectIds={overdueProjectIds}
            onDeleteTask={handleDeleteTask}
            onDeleteProject={handleDeleteProject}
            onUpdateTask={handleUpdateTask}
            onResolveOverdueDone={handleArchiveTaskAsDone}
            onResolveOverdueKeep={handleKeepTaskOverdue}
            onTaskSheetVisibilityChange={setIsProjectTaskSheetOpen}
          />
        </section>
      </main>

      {isBottomNavVisible && (
        <nav className="app-nav" aria-label="Navegacao principal">
          <div className="app-nav__inner">
            {navItems.map(({ id, icon, label }) => {
              const isActive = id === activeIndex
              return (
                <button key={id} type="button" onClick={() => goTo(id)} className="app-nav__button" aria-label={label} aria-pressed={isActive}>
                  <MotionDiv initial={false} animate={{ scale: isActive ? 0 : 1, opacity: isActive ? 0 : 1 }} className="app-nav__dot" />
                  <MotionDiv initial={false} animate={{ scale: isActive ? 1 : 0.5, opacity: isActive ? 1 : 0 }} className="app-nav__icon">
                    {icon}
                  </MotionDiv>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

export default App
