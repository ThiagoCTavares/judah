import { createElement, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Clock, PushPin } from '@phosphor-icons/react'
import { getProjectIconById } from '../constants'
import { getTaskDisplayTime } from '../task-utils'
 

const MotionDiv = motion.div

function getCompactTaskDateLabel(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}`
}

export function OverdueTaskModal({ task, projects, remainingCount, onMarkDone, onReschedule, onKeep }) {
  const mediumColor = 'var(--judah-medium)'
  const darkColor = 'var(--judah-dark)'

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  )

  const project = task?.projectId ? projectsById.get(task.projectId) : null
  const projectName = task?.projectId
    ? project?.name || 'Sem projeto'
    : 'Sem projeto'
  const projectColor = project?.color || 'var(--judah-dark)'
  const projectIconNode = useMemo(
    () => createElement(getProjectIconById(project?.iconId), { size: 14, weight: 'regular' }),
    [project?.iconId]
  )
  const scheduleLabel = `${getCompactTaskDateLabel(task?.dateKey)} - ${getTaskDisplayTime(task)}`

  if (!task) return null

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 12000, backgroundColor: 'rgba(0,0,0,0.32)' }}
      />

      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 12001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: '380px', padding: '22px 20px 18px 20px', borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 18px 40px rgba(0,0,0,0.18)', boxSizing: 'border-box' }}
        >
          <p style={{ margin: '0 0 40px 0', fontSize: '1.5rem', lineHeight: '1.15', color: darkColor, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>
            TASK VENCIDA
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: projectColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
              {projectIconNode}
            </div>
            <span style={{ fontSize: '17px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: mediumColor }}>
              {projectName}
            </span>
          </div>

          {remainingCount > 1 && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: mediumColor, textAlign: 'center' }}>
              Restam {remainingCount} tasks vencidas nesta abertura.
            </p>
          )}

          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: '1.2', color: darkColor, textAlign: 'center', marginBottom: '10px' }}>
                {task.name}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: '1.2', color: darkColor, textAlign: 'center' }}>
                {scheduleLabel}
              </div>
            </div>

          </div>

          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px' }}>
            <button
              type="button"
              onClick={onKeep}
              style={{ padding: 0, border: 'none', background: 'transparent', color: darkColor, opacity: 1, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PushPin size={16} weight="bold" />
              Manter
            </button>
            <button
              type="button"
              onClick={onReschedule}
              style={{ padding: 0, border: 'none', background: 'transparent', color: darkColor, opacity: 1, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Clock size={16} weight="bold" />
              Adiar
            </button>
            <button
              type="button"
              onClick={onMarkDone}
              style={{ padding: 0, border: 'none', background: 'transparent', color: darkColor, opacity: 1, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={16} weight="bold" />
              Feita
            </button>
          </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  )
}
