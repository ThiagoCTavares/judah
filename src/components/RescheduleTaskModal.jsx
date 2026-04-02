import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarBlank, CaretDown, Clock } from '@phosphor-icons/react'
import { isTaskScheduleInFuture } from '../task-utils'

const TIME_OPTIONS = [
  { id: 'none', label: 'Sem horário' },
  { id: 'morning', label: 'Manhã' },
  { id: 'afternoon', label: 'Tarde' },
  { id: 'night', label: 'Noite' },
  { id: 'custom', label: 'Personalizado' },
]

const MotionDiv = motion.div

export function RescheduleTaskModal({ task, onCancel, onSave }) {
  const [dateKey, setDateKey] = useState(task?.dateKey || '')
  const [timeOption, setTimeOption] = useState(task?.timeOption || 'none')
  const [startTime, setStartTime] = useState(task?.startTime || '')
  const [endTime, setEndTime] = useState(task?.endTime || '')

  const darkColor = 'var(--judah-dark)'
  const mediumColor = 'var(--judah-medium)'
  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: mediumColor,
  }

  const nextTaskPreview = useMemo(() => ({
    ...task,
    dateKey,
    timeOption,
    startTime: timeOption === 'custom' ? startTime : '',
    endTime: timeOption === 'custom' ? endTime : '',
  }), [dateKey, endTime, startTime, task, timeOption])

  const isCustomTimeValid = timeOption !== 'custom' || (startTime && endTime)
  const isScheduleValid = Boolean(dateKey) && isCustomTimeValid && isTaskScheduleInFuture(nextTaskPreview, new Date())

  if (!task) return null

  const handleSave = () => {
    const updatedTask = {
      ...task,
      dateKey,
      timeOption,
      startTime: timeOption === 'custom' ? startTime : '',
      endTime: timeOption === 'custom' ? endTime : '',
    }

    if (!isTaskScheduleInFuture(updatedTask, new Date())) return

    onSave({
      dateKey,
      timeOption,
      startTime: timeOption === 'custom' ? startTime : '',
      endTime: timeOption === 'custom' ? endTime : '',
    })
  }

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, zIndex: 12100, backgroundColor: 'rgba(0,0,0,0.32)' }}
      />

      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 12101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(event) => event.stopPropagation()}
          style={{ width: '100%', maxWidth: '380px', padding: '22px 20px 18px 20px', borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 18px 40px rgba(0,0,0,0.18)', boxSizing: 'border-box' }}
        >
          <p style={{ margin: 0, fontSize: '1.5rem', lineHeight: '1.15', color: darkColor, fontWeight: 700 }}>
            Reagendar
          </p>

          <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>
                <CalendarBlank size={15} weight="bold" /> Nova data
              </label>
              <input
                type="date"
                value={dateKey}
                onChange={(event) => setDateKey(event.target.value)}
                style={{ width: '100%', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)', borderRadius: 0, padding: '4px 0 8px 0', fontSize: '18px', fontWeight: 500, color: darkColor, backgroundColor: 'transparent', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <Clock size={15} weight="bold" /> Horário
              </label>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', width: '100%' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <select
                    value={timeOption}
                    onChange={(event) => setTimeOption(event.target.value)}
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
                        <span style={{ fontSize: '18px', fontWeight: 500, color: timeOption ? darkColor : mediumColor }}>
                          {TIME_OPTIONS.find((option) => option.id === timeOption)?.label || 'Selecione...'}
                        </span>
                        <CaretDown size={20} color={mediumColor} weight="bold" />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'flex-end', opacity: timeOption === 'custom' ? 1 : 0, pointerEvents: timeOption === 'custom' ? 'auto' : 'none', transition: 'opacity 0.2s ease' }}>
                  <div style={{ flex: 1, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: mediumColor, textTransform: 'uppercase', marginBottom: '2px', height: '12px', lineHeight: '12px' }}>
                      De
                    </span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
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
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: 500, textAlign: 'center', color: darkColor, outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: 0, border: 'none', background: 'transparent', color: darkColor, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isScheduleValid}
              style={{ padding: 0, border: 'none', background: 'transparent', color: isScheduleValid ? darkColor : mediumColor, fontSize: '0.95rem', fontWeight: 700, cursor: isScheduleValid ? 'pointer' : 'not-allowed', opacity: isScheduleValid ? 1 : 0.5 }}
            >
              Salvar
            </button>
          </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  )
}
