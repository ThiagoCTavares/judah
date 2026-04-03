import { createElement, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarBlank, CaretDown, Clock, Hash, ListChecks, PuzzlePiece, Trash, X } from '@phosphor-icons/react'
import { getProjectIconById } from '../constants'
import { formatTaskDateLabel, getTaskDisplayTime, isTaskOverdue } from '../task-utils'

const MotionDiv = motion.div

const TIME_OPTIONS = [
  { id: 'none', label: 'Sem horário' },
  { id: 'morning', label: 'Manhã' },
  { id: 'afternoon', label: 'Tarde' },
  { id: 'night', label: 'Noite' },
  { id: 'custom', label: 'Personalizado' },
]

function getTaskDetailsTime(task) {
  if (!task) return 'Sem horário'
  if (task.timeOption !== 'custom') return getTaskDisplayTime(task)
  if (task.startTime && task.endTime) return `${task.startTime} - ${task.endTime}`
  return task.startTime || 'Personalizado'
}

function createDraftFromTask(task) {
  return {
    name: task?.name || '',
    projectId: task?.projectId || null,
    dateKey: task?.dateKey || '',
    timeOption: task?.timeOption || 'none',
    startTime: task?.startTime || '',
    endTime: task?.endTime || '',
    details: task?.details || '',
  }
}

export function TaskDetailsSheet({
  task,
  projects,
  onClose,
  onDeleteTask,
  onUpdateTask,
  onResolveOverdueDone,
  onResolveOverdueKeep,
}) {
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false)
  const [dismissedOverduePromptTaskId, setDismissedOverduePromptTaskId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(() => createDraftFromTask(task))

  const darkColor = 'var(--judah-dark)'
  const mediumColor = 'var(--judah-medium)'
  const lightColor = 'var(--judah-light)'

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: mediumColor,
    marginBottom: '12px',
  }

  const sectionStyle = { marginBottom: '32px' }
  const readOnlyButtonStyle = {
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  }

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  )

  const displayTask = isEditing
    ? {
        ...task,
        ...draft,
        projectId: draft.projectId,
        startTime: draft.timeOption === 'custom' ? draft.startTime : '',
        endTime: draft.timeOption === 'custom' ? draft.endTime : '',
      }
    : task

  const project = displayTask?.projectId ? projectsById.get(displayTask.projectId) : null
  const projectIconNode = useMemo(
    () => createElement(getProjectIconById(project?.iconId), { size: 16, weight: 'regular' }),
    [project?.iconId]
  )
  const shouldShowOverduePrompt = isTaskOverdue(task) && dismissedOverduePromptTaskId !== task?.id
  const isCustomTimeValid = draft.timeOption !== 'custom' || (draft.startTime && draft.endTime)
  const isSaveDisabled = !draft.name.trim() || !draft.dateKey || !draft.timeOption || !isCustomTimeValid

  if (!task) return null

  const handleClose = () => {
    setIsDeleteConfirmVisible(false)
    setIsEditing(false)
    setDraft(createDraftFromTask(task))
    onClose()
  }

  const handleConfirmDelete = () => {
    onDeleteTask(task.id)
    setIsDeleteConfirmVisible(false)
    onClose()
  }

  const handleResolveDone = () => {
    onResolveOverdueDone?.(task.id)
    handleClose()
  }

  const handleResolveKeep = () => {
    setDismissedOverduePromptTaskId(task.id)
    onResolveOverdueKeep?.(task.id)
  }

  const handleStartEditing = () => {
    setDraft(createDraftFromTask(task))
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    setDraft(createDraftFromTask(task))
    setIsEditing(false)
  }

  const handleSaveEditing = () => {
    if (isSaveDisabled) return

    const nextValues = {
      name: draft.name.trim(),
      projectId: draft.projectId,
      dateKey: draft.dateKey,
      timeOption: draft.timeOption,
      startTime: draft.timeOption === 'custom' ? draft.startTime : '',
      endTime: draft.timeOption === 'custom' ? draft.endTime : '',
      details: draft.details.trim(),
    }

    const shouldCloseAfterSave = task.dateKey !== nextValues.dateKey || (task.projectId || null) !== (nextValues.projectId || null)

    onUpdateTask?.(task.id, nextValues)
    setDraft(nextValues)
    setIsEditing(false)

    if (shouldCloseAfterSave) onClose()
  }

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="modal-backdrop"
      />

      <MotionDiv
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="modal-sheet"
        style={{ height: '70vh', boxSizing: 'border-box' }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar detalhes da task"
          style={{ position: 'absolute', top: '-32px', height: '32px', width: '48px', right: 0, backgroundColor: darkColor, border: 'none', borderTopLeftRadius: '12px', borderTopRightRadius: '0px', borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)', paddingLeft: '4px' }}
        >
          <X size={18} color="var(--judah-pure)" weight="bold" />
        </button>

        <div className="modal-sheet__body">
          {shouldShowOverduePrompt && (
            <div style={{ ...sectionStyle, marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '18px', fontWeight: 600, color: darkColor, letterSpacing: '-0.02em' }}>
                  Já foi feito?
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={handleResolveDone}
                    style={{ padding: 0, border: 'none', background: 'transparent', color: 'var(--judah-black)', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={handleResolveKeep}
                    style={{ padding: 0, border: 'none', background: 'transparent', color: darkColor, fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Não
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={sectionStyle}>
            <label style={labelStyle}>
              <Hash size={16} weight="bold" /> Task
            </label>
            {isEditing ? (
              <input
                type="text"
                value={draft.name}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))}
                style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '24px', fontWeight: 700, color: darkColor, outline: 'none', lineHeight: '1.2', boxSizing: 'border-box' }}
              />
            ) : (
              <button type="button" onClick={handleStartEditing} style={readOnlyButtonStyle}>
                <div style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '24px', fontWeight: 700, color: darkColor, outline: 'none', lineHeight: '1.2', boxSizing: 'border-box' }}>
                  {task.name}
                </div>
              </button>
            )}
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>
              <PuzzlePiece size={16} weight="bold" /> Projeto
            </label>
            {isEditing ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <select
                  value={draft.projectId || 'none'}
                  onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, projectId: event.target.value === 'none' ? null : event.target.value }))}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, zIndex: 10 }}
                >
                  <option value="none">Sem projeto</option>
                  {projects.map((projectOption) => (
                    <option key={projectOption.id} value={projectOption.id}>{projectOption.name}</option>
                  ))}
                </select>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', padding: '8px 0px', borderRadius: '0px', width: '100%', boxSizing: 'border-box', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    {project && (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: project.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                        {projectIconNode}
                      </div>
                    )}
                    <span style={{ fontSize: '18px', fontWeight: 500, color: darkColor, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project?.name || 'Sem projeto'}
                    </span>
                  </div>
                  <CaretDown size={20} color={mediumColor} weight="bold" />
                </div>
              </div>
            ) : (
              <button type="button" onClick={handleStartEditing} style={readOnlyButtonStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', padding: '8px 0px', borderRadius: '0px', width: '100%', boxSizing: 'border-box', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {task.projectId && project && (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: project.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                        {projectIconNode}
                      </div>
                    )}
                    <span style={{ fontSize: '18px', fontWeight: 500, color: darkColor }}>
                      {task.projectId ? project?.name || 'Sem projeto' : 'Sem projeto'}
                    </span>
                  </div>
                </div>
              </button>
            )}
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>
              <CalendarBlank size={16} weight="bold" /> Data
            </label>
            {isEditing ? (
              <input
                type="date"
                value={draft.dateKey}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, dateKey: event.target.value }))}
                style={{ width: '100%', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)', borderRadius: 0, padding: '4px 0 8px 0', fontSize: '18px', fontWeight: 500, color: darkColor, backgroundColor: 'transparent', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
              />
            ) : (
              <button type="button" onClick={handleStartEditing} style={readOnlyButtonStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', padding: '4px 0px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '18px', fontWeight: 500, color: darkColor }}>
                    {formatTaskDateLabel(task.dateKey)}
                  </span>
                </div>
              </button>
            )}
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>
              <Clock size={16} weight="bold" /> Horário
            </label>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', width: '100%' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <select
                    value={draft.timeOption}
                    onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, timeOption: event.target.value }))}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, zIndex: 10 }}
                  >
                    {TIME_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', padding: '4px 0px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                    <div style={{ width: '100%' }}>
                      <span style={{ display: 'block', height: '12px', marginBottom: '2px', visibility: 'hidden' }}>Ghost</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '18px', fontWeight: 500, color: darkColor }}>
                          {TIME_OPTIONS.find((option) => option.id === draft.timeOption)?.label || 'Selecione...'}
                        </span>
                        <CaretDown size={20} color={mediumColor} weight="bold" />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'flex-end', opacity: draft.timeOption === 'custom' ? 1 : 0, pointerEvents: draft.timeOption === 'custom' ? 'auto' : 'none', transition: 'opacity 0.2s ease' }}>
                  <div style={{ flex: 1, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: mediumColor, textTransform: 'uppercase', marginBottom: '2px', height: '12px', lineHeight: '12px' }}>
                      De
                    </span>
                    <input
                      type="time"
                      value={draft.startTime}
                      onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, startTime: event.target.value }))}
                      style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: 500, textAlign: 'center', color: darkColor, outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>

                  <span style={{ fontWeight: 'bold', color: mediumColor, paddingBottom: '8px' }}>:</span>

                  <div style={{ flex: 1, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: mediumColor, textTransform: 'uppercase', marginBottom: '2px', height: '12px', lineHeight: '12px' }}>
                      Até
                    </span>
                    <input
                      type="time"
                      value={draft.endTime}
                      onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, endTime: event.target.value }))}
                      style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: 500, textAlign: 'center', color: darkColor, outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <button type="button" onClick={handleStartEditing} style={readOnlyButtonStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', padding: '4px 0px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '100%' }}>
                    <span style={{ display: 'block', height: '12px', marginBottom: '2px', visibility: 'hidden' }}>Ghost</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 500, color: darkColor }}>
                        {getTaskDetailsTime(task)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )}
          </div>

          <div style={{ marginBottom: 0 }}>
            <label style={labelStyle}>
              <ListChecks size={16} weight="bold" /> Detalhes
            </label>
            {isEditing ? (
              <textarea
                rows={5}
                value={draft.details}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, details: event.target.value }))}
                style={{ width: '100%', backgroundColor: 'transparent', borderRadius: '16px', padding: '20px', border: `1px solid ${lightColor}`, fontSize: '16px', color: darkColor, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            ) : (
              <button type="button" onClick={handleStartEditing} style={readOnlyButtonStyle}>
                <div style={{ width: '100%', minHeight: '124px', backgroundColor: 'transparent', borderRadius: '16px', padding: '20px', border: `1px solid ${lightColor}`, fontSize: '16px', color: task.details ? darkColor : mediumColor, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', whiteSpace: 'pre-wrap', lineHeight: '1.45' }}>
                  {task.details || 'Sem detalhes'}
                </div>
              </button>
            )}
          </div>

          {!isEditing && (
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setIsDeleteConfirmVisible(true)}
                aria-label="Excluir task"
                style={{ padding: 0, border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}
              >
                <Trash size={20} weight="bold" />
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isEditing && (
            <MotionDiv
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="modal-sheet__footer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}
            >
              <button
                type="button"
                onClick={handleCancelEditing}
                style={{ padding: 0, border: 'none', background: 'transparent', color: darkColor, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditing}
                disabled={isSaveDisabled}
                style={{ padding: 0, border: 'none', background: 'transparent', color: isSaveDisabled ? mediumColor : 'var(--judah-black)', fontSize: '0.95rem', fontWeight: 700, cursor: isSaveDisabled ? 'not-allowed' : 'pointer', opacity: isSaveDisabled ? 0.5 : 1 }}
              >
                Salvar
              </button>
            </MotionDiv>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isDeleteConfirmVisible && (
            <>
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDeleteConfirmVisible(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.32)' }}
              />

              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
              >
                <MotionDiv
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  onClick={(event) => event.stopPropagation()}
                  style={{ width: '100%', maxWidth: '360px', padding: '22px 20px 18px 20px', borderRadius: '22px', backgroundColor: '#ffffff', boxShadow: '0 18px 40px rgba(0,0,0,0.18)', boxSizing: 'border-box' }}
                >
                  <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.45', color: darkColor }}>
                    Excluir esta task permanentemente?
                  </p>
                  <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirmVisible(false)}
                      style={{ padding: 0, border: 'none', background: 'transparent', color: mediumColor, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      style={{ padding: 0, border: 'none', background: 'transparent', color: '#dc2626', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Excluir
                    </button>
                  </div>
                </MotionDiv>
              </MotionDiv>
            </>
          )}
        </AnimatePresence>
      </MotionDiv>
    </AnimatePresence>
  )
}
