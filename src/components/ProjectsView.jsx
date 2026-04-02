import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from '@phosphor-icons/react'
import { ProjectCreatorCard } from './ProjectCreatorCard'
import { getProjectIconById } from '../constants'
import { TaskDetailsSheet } from './TaskDetailsSheet'
import { formatTaskDateLabel, getTaskDisplayTime, isTaskOverdue, sortTasksByDateAndTime } from '../task-utils'

function createProjectId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `project-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const MotionDiv = motion.div

export function ProjectsView({ projects, setProjects, activeTasks, archivedTasks, overdueProjectIds, onDeleteTask, onResolveOverdueDone, onResolveOverdueKeep, onTaskSheetVisibilityChange }) {
  const [isCreating, setIsCreating] = useState(false)
  const [expandedProjectId, setExpandedProjectId] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [archivedVisibleProjectId, setArchivedVisibleProjectId] = useState(null)

  const tasksByProjectId = useMemo(() => {
    const nextMap = new Map()

    for (const task of sortTasksByDateAndTime(activeTasks)) {
      if (!task.projectId) continue
      if (!nextMap.has(task.projectId)) nextMap.set(task.projectId, [])
      nextMap.get(task.projectId).push(task)
    }

    return nextMap
  }, [activeTasks])

  const archivedTasksByProjectId = useMemo(() => {
    const nextMap = new Map()

    for (const task of sortTasksByDateAndTime(archivedTasks)) {
      if (!task.projectId) continue
      if (!nextMap.has(task.projectId)) nextMap.set(task.projectId, [])
      nextMap.get(task.projectId).push(task)
    }

    return nextMap
  }, [archivedTasks])

  const allProjectTasks = useMemo(() => [...activeTasks, ...archivedTasks], [activeTasks, archivedTasks])

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null
    return allProjectTasks.find((task) => task.id === selectedTaskId) || null
  }, [allProjectTasks, selectedTaskId])

  useEffect(() => {
    onTaskSheetVisibilityChange?.(Boolean(selectedTask))
  }, [onTaskSheetVisibilityChange, selectedTask])

  useEffect(() => {
    return () => {
      onTaskSheetVisibilityChange?.(false)
    }
  }, [onTaskSheetVisibilityChange])

  const handleSaveProject = (newProject) => {
    setProjects((currentProjects) => [
      ...currentProjects,
      {
        id: createProjectId(),
        ...newProject,
      },
    ])
    setIsCreating(false)
  }

  const handleToggleProject = (projectId) => {
    setArchivedVisibleProjectId(null)
    setExpandedProjectId((currentProjectId) => (
      currentProjectId === projectId ? null : projectId
    ))
  }

  const handleCloseTaskSheet = () => {
    setSelectedTaskId(null)
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', boxSizing: 'border-box', padding: '60px 24px 80px 24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AnimatePresence>
        {expandedProjectId && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setExpandedProjectId(null)
              setArchivedVisibleProjectId(null)
            }}
            className="modal-backdrop"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ fontSize: '1.25rem', color: '#121212', fontWeight: 400, letterSpacing: '-0.025em' }}>Projetos</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0px' }}>
        
        {/* LISTA DE PROJETOS */}
        {projects.map((project, index) => {
          const ProjectIcon = typeof project.icon === 'function'
            ? project.icon
            : getProjectIconById(project.iconId)
          const projectTasks = tasksByProjectId.get(project.id) || []
          const archivedProjectTasks = archivedTasksByProjectId.get(project.id) || []
          const isExpanded = expandedProjectId === project.id
          const isArchivedVisible = archivedVisibleProjectId === project.id
          const hasOverdueTasks = overdueProjectIds.has(project.id)

          return (
            <div key={project.id || index} style={{ width: '100%', position: 'relative', zIndex: isExpanded ? 9999 : 'auto' }}>
              <button
                type="button"
                onClick={() => handleToggleProject(project.id)}
                aria-expanded={isExpanded}
                style={{ width: '100%', height: '96px', borderRadius: '24px', backgroundColor: 'transparent', border: 'none', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', boxShadow: 'none', boxSizing: 'border-box', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: project.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  <ProjectIcon size={24} weight="regular" />
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0px' }}>
                  <h3 style={{
                    fontSize: '24px', fontWeight: 700, color: '#121212',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    lineHeight: '1.2',
                    marginTop: '6px',
                    marginBottom: '0px'
                  }}>
                    {project.name}
                  </h3>
                  {project.details && (
                    <p style={{
                      fontSize: '14px', color: '#919191',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      marginTop: '2px',
                      lineHeight: '1.4'
                    }}>
                      {project.details}
                    </p>
                  )}
                </div>

                {hasOverdueTasks && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', flexShrink: 0 }} />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <MotionDiv
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 24px 12px 88px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {projectTasks.length > 0 ? (
                        projectTasks.map((task) => {
                          const isOverdueTask = isTaskOverdue(task, new Date())
                          const metaColor = isOverdueTask ? '#dc2626' : '#6f6f6f'

                          return (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() => setSelectedTaskId(task.id)}
                              style={{ width: '100%', padding: '10px 0', border: 'none', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', textAlign: 'left', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', minWidth: 0 }}>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#121212', lineHeight: '1.25' }}>
                                  {task.name}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '13px', color: metaColor, fontWeight: 500 }}>
                                    {formatTaskDateLabel(task.dateKey)}
                                  </span>
                                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isOverdueTask ? '#dc2626' : '#bdbdbd' }} />
                                  <span style={{ fontSize: '13px', color: metaColor, fontWeight: 500 }}>
                                    {getTaskDisplayTime(task)}
                                  </span>
                                </div>
                              </div>

                              {isOverdueTask && (
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', flexShrink: 0 }} />
                              )}
                            </button>
                          )
                        })
                      ) : (
                        <p style={{ margin: 0, padding: '4px 0 12px 0', fontSize: '14px', color: '#919191', lineHeight: '1.4' }}>
                          Nenhuma task vinculada a este projeto.
                        </p>
                      )}

                      {archivedProjectTasks.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setArchivedVisibleProjectId(isArchivedVisible ? null : project.id)}
                            style={{ marginTop: projectTasks.length > 0 ? '8px' : 0, padding: 0, border: 'none', background: 'transparent', color: '#6f6f6f', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Arquivadas ({archivedProjectTasks.length})
                          </button>

                          <AnimatePresence initial={false}>
                            {isArchivedVisible && (
                              <MotionDiv
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {archivedProjectTasks.map((task) => (
                                    <button
                                      key={task.id}
                                      type="button"
                                      onClick={() => setSelectedTaskId(task.id)}
                                      style={{ width: '100%', padding: '10px 0', border: 'none', backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', textAlign: 'left', cursor: 'pointer', opacity: 0.72 }}
                                    >
                                      <span style={{ fontSize: '16px', fontWeight: 600, color: '#121212', lineHeight: '1.25' }}>
                                        {task.name}
                                      </span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '13px', color: '#6f6f6f', fontWeight: 500 }}>
                                          {formatTaskDateLabel(task.dateKey)}
                                        </span>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#bdbdbd' }} />
                                        <span style={{ fontSize: '13px', color: '#6f6f6f', fontWeight: 500 }}>
                                          {getTaskDisplayTime(task)}
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </MotionDiv>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
        )})}

        {/* SLOT DE CRIAÇÃO */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            style={{ width: '100%', height: '96px', borderRadius: '24px', backgroundColor: 'transparent', border: 'none', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', cursor: 'pointer', flexShrink: 0, boxSizing: 'border-box', appearance: 'none', WebkitAppearance: 'none', outline: 'none', WebkitTapHighlightColor: 'transparent' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#919191', flexShrink: 0 }}>
              <Plus size={24} weight="bold" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 600, lineHeight: '1.2', color: '#919191' }}>Criar Novo Projeto</span>
          </button>
        ) : (
          <ProjectCreatorCard onSave={handleSaveProject} onCancel={() => setIsCreating(false)} />
        )}

      </div>

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
