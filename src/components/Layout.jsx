import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNavigation from './BottomNavigation'
import TodayScreen from '../screens/TodayScreen'
import FocusScreen from '../screens/FocusScreen'

const transition = { duration: 0.25, ease: 'easeOut' }

function Layout() {
  const [activeTab, setActiveTab] = useState('today')

  return (
    <div className="h-screen bg-white text-zinc-900">
      <div className="relative flex h-full flex-col">
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.main
              key={activeTab}
              className="h-full px-6 pt-8 pb-24"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={transition}
            >
              {activeTab === 'today' ? <TodayScreen /> : <FocusScreen />}
            </motion.main>
          </AnimatePresence>
        </div>
        <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}

export default Layout
