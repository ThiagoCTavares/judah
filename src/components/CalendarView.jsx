import { Sun, Plus } from '@phosphor-icons/react'
import { WEEKDAYS, DAILY_TASKS } from '../constants'

export function CalendarView({ cells, monthLabel, today, selectedDate, onSelectDate, selectedDateInfo, onOpenTaskModal }) {
  const borderColor = '#CCCCCC'; 
  const headerColor = '#121212'; 
  const dayColor = '#363636';    
  const activeDayBg = '#363636'; 

  const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()

  const handleDayClick = (day) => {
    if (!day) return
    const newDate = new Date(today.getFullYear(), today.getMonth(), day)
    onSelectDate(newDate)
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '60px 24px 0 24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ fontSize: '1.25rem', color: '#121212', fontWeight: 400, letterSpacing: '-0.025em' }}>{monthLabel}</div>
      </div>

      <div style={{ width: '100%', borderTop: `1px solid ${borderColor}`, borderLeft: `1px solid ${borderColor}`, backgroundColor: '#e8e8e8' }}>
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
            return (
              <div key={index} onClick={() => handleDayClick(day)} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px', minHeight: '80px', borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, cursor: day ? 'pointer' : 'default', backgroundColor: isSelected ? 'rgba(0,0,0,0.03)' : 'transparent' }}>
                {day ? (
                  <span style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: isToday ? activeDayBg : 'transparent', color: isToday ? '#ffffff' : dayColor, fontWeight: isToday ? 500 : 400, fontSize: '0.875rem' }}>{day}</span>
                ) : <span />}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.875rem', color: '#919191', fontWeight: 400 }}>{isSameDay(selectedDate, today) ? 'Hoje é' : 'Visualizando'}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', color: '#121212', fontWeight: 500, letterSpacing: '-0.025em' }}>{selectedDateInfo.weekday},</span>
            <span style={{ fontSize: '2rem', color: '#121212', fontWeight: 500, letterSpacing: '-0.025em' }}>{selectedDateInfo.dayNum}</span>
            <div style={{ transform: 'translateY(2px)', marginLeft: '4px' }}><Sun color="#121212" size={28} weight="light" /></div>
          </div>
        </div>
        <button onClick={onOpenTaskModal} style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginBottom: '4px' }}><Plus color="#ffffff" size={24} weight="bold" /></button>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '20px', maskImage: 'linear-gradient(to right, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)' }}>
        {DAILY_TASKS.map((task) => (
          <div key={task.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: task.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <task.icon color="#ffffff" size={26} weight="regular" />
            </div>
            <span style={{ fontSize: '0.875rem', color: '#363636', fontWeight: 500 }}>{task.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}