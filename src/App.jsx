import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, PuzzlePiece } from '@phosphor-icons/react'
import { NewTaskModal } from './components/NewTaskModal'
import { CalendarView } from './components/CalendarView'
import { ProjectsView } from './components/ProjectsView'
import { MONTH_NAMES, WEEKDAYS_FULL } from './constants'

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [projects, setProjects] = useState([]) 

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
    const year = today.getFullYear()
    const month = today.getMonth()
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
  }, [today])

  const selectedDateInfo = useMemo(() => {
    const weekday = WEEKDAYS_FULL[selectedDate.getDay()]
    const dayNum = selectedDate.getDate()
    return { weekday, dayNum }
  }, [selectedDate])

  const navItems = [
    { id: 0, Icon: Calendar },
    { id: 1, Icon: PuzzlePiece },
  ]

  return (
    <div className="font-sans text-judah-black bg-[#e8e8e8]">
      <AnimatePresence>
        {isTaskModalOpen && <NewTaskModal onClose={() => setIsTaskModalOpen(false)} />}
      </AnimatePresence>

      <main ref={mainRef} onScroll={handleScroll} style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: '100dvh', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', backgroundColor: '#e8e8e8' }} className="fixed inset-0 overscroll-x-contain z-0">
        <section style={{ minWidth: '100vw', width: '100vw' }} className="h-full snap-center overflow-y-auto pb-32">
          <CalendarView cells={calendarCells} monthLabel={monthLabel} today={today} selectedDate={selectedDate} onSelectDate={setSelectedDate} selectedDateInfo={selectedDateInfo} onOpenTaskModal={() => setIsTaskModalOpen(true)} />
        </section>

        <section style={{ minWidth: '100vw', width: '100vw' }} className="h-full snap-center overflow-y-auto pb-32">
          <ProjectsView projects={projects} setProjects={setProjects} />
        </section>
      </main>

      <nav style={{ position: 'fixed', bottom: '40px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 40, pointerEvents: 'none' }}>
        <div className="pointer-events-auto flex items-center gap-8">
          {navItems.map(({ id, Icon }) => {
            const isActive = id === activeIndex
            return (
              <div key={id} onClick={() => goTo(id)} className="relative flex items-center justify-center cursor-pointer" style={{ width: 40, height: 40 }}>
                <motion.div initial={false} animate={{ scale: isActive ? 0 : 1, opacity: isActive ? 0 : 1 }} style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#121212' }} />
                <motion.div initial={false} animate={{ scale: isActive ? 1 : 0.5, opacity: isActive ? 1 : 0 }} style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon color="#121212" size={24} weight="regular" />
                </motion.div>
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App