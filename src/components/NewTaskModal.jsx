import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, CaretDown, Check, Hash, PuzzlePiece, ListChecks, PencilSimple } from '@phosphor-icons/react'

// Mock de Projetos
const PROJECTS = [
  { id: 1, name: 'Pessoal', color: '#f59e0b' },
  { id: 2, name: 'Trabalho', color: '#3b82f6' },
  { id: 3, name: 'Estudos', color: '#ec4899' },
  { id: 4, name: 'Saúde', color: '#10b981' },
]

// Opções de Horário
const TIME_OPTIONS = [
  { id: 'none', label: 'Sem horário' },
  { id: 'morning', label: 'Manhã' },
  { id: 'afternoon', label: 'Tarde' },
  { id: 'night', label: 'Noite' },
  { id: 'custom', label: 'Personalizado' }
]

export function NewTaskModal({ onClose }) {
  // ESTADOS
  const [taskName, setTaskName] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [timeOption, setTimeOption] = useState(null)
  
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  
  const [isProjectVisible, setIsProjectVisible] = useState(false)
  const [areCustomTimesValid, setAreCustomTimesValid] = useState(false)

  // --- LÓGICA DE VISIBILIDADE ---
  const showProjectSection = isProjectVisible
  const showTimeSection = showProjectSection && selectedProject !== ''
  const showDetailsAndButton = showTimeSection && (
    (timeOption !== 'custom' && timeOption !== null) || 
    (timeOption === 'custom' && areCustomTimesValid)
  )

  // Cores
  const darkColor = '#363636'; 
  const mediumColor = '#919191';
  const lightColor = '#CCCCCC'; 

  // --- HANDLERS ---
  const handleNameCommit = () => {
    if (taskName.trim().length > 0) setIsProjectVisible(true)
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
      handleNameCommit()
    }
  }

  const handleCustomTimeBlur = () => {
    if (startTime !== '' && endTime !== '') {
      setAreCustomTimesValid(true)
    }
  }

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value)
    if (e.target.value === '') setAreCustomTimesValid(false)
  }
  
  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value)
    if (e.target.value === '') setAreCustomTimesValid(false)
  }

  const handleTimeOptionChange = (e) => {
    setTimeOption(e.target.value)
    setAreCustomTimesValid(false)
  }

  // Estilos reutilizáveis
  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: mediumColor, marginBottom: '12px'
  }

  const sectionStyle = { marginBottom: '32px' }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          backgroundColor: 'rgba(0,0,0,0.05)', 
          backdropFilter: 'blur(1px)' 
        }}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ 
          position: 'fixed', 
          bottom: 0, left: 0, right: 0, 
          zIndex: 9999, 
          height: '70vh', 
          backgroundColor: '#e8e8e8', 
          borderRadius: '0px', 
          display: 'flex', 
          flexDirection: 'column',
          fontFamily: '"depot-new-web", "depot-new", sans-serif',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
          boxSizing: 'border-box'
        }}
      >
        
        {/* ABA */}
        <div 
          onClick={onClose}
          style={{
            position: 'absolute', top: '-32px', height: '32px', width: '48px', right: '0', 
            backgroundColor: darkColor, 
            borderTopLeftRadius: '12px', borderTopRightRadius: '0px', borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 -4px 10px rgba(0,0,0,0.05)', paddingLeft: '4px' 
          }}
        >
           <X size={18} color="#ffffff" weight="bold" />
        </div>

        {/* BODY (ÁREA DE SCROLL) */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '40px 24px 128px 24px',
          width: '100%', 
          boxSizing: 'border-box',
          // --- A MÁGICA DO DEGRADÊ SUPERIOR ---
          // Cria uma máscara que é transparente no topo (0%) e fica totalmente visível após 40px
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40px, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40px, black 100%)'
        }}>
          
          {/* 1. NOME */}
          <div style={sectionStyle}>
            <label style={labelStyle}>
              <Hash size={16} weight="bold" /> Atividade
            </label>

            <input 
              type="text" 
              placeholder="O que vamos fazer?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onBlur={handleNameCommit}
              onKeyDown={handleNameKeyDown}
              style={{ 
                width: '100%', background: 'transparent', border: 'none', 
                fontSize: '24px', fontWeight: 700, color: darkColor,
                outline: 'none', lineHeight: '1.2', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 2. PROJETO */}
          <motion.div
            initial={false}
            animate={{ 
              height: showProjectSection ? 'auto' : 0, 
              opacity: showProjectSection ? 1 : 0,
              marginBottom: showProjectSection ? 32 : 0
            }}
            style={{ overflow: 'hidden' }}
          >
            <label style={labelStyle}>
              <PuzzlePiece size={16} weight="bold" /> Projeto
            </label>
            
            <div style={{ position: 'relative', width: '100%' }}>
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, zIndex: 10 }}
              >
                <option value="">Sem projeto</option>
                {PROJECTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'transparent', padding: '8px 0px', borderRadius: '0px',
                width: '100%', boxSizing: 'border-box', borderBottom: '1px solid rgba(0,0,0,0.05)'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 500, color: selectedProject ? darkColor : mediumColor }}>
                  {selectedProject 
                    ? PROJECTS.find(p => p.id == selectedProject)?.name 
                    : 'Selecione um projeto...'}
                </span>
                <CaretDown size={20} color={mediumColor} weight="bold" />
              </div>
            </div>
          </motion.div>

          {/* 3. HORÁRIO */}
          <motion.div
            initial={false}
            animate={{ 
              height: showTimeSection ? 'auto' : 0, 
              opacity: showTimeSection ? 1 : 0,
              marginBottom: showTimeSection ? 32 : 0
            }}
            style={{ overflow: 'hidden' }}
          >
            <label style={labelStyle}>
              <Clock size={16} weight="bold" /> Horário
            </label>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', width: '100%' }}>
              
              {/* Dropdown Esquerda */}
              <div style={{ flex: 1, position: 'relative' }}>
                <select 
                  value={timeOption || ''}
                  onChange={handleTimeOptionChange}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, zIndex: 10 }}
                >
                  <option value="" disabled>Selecione...</option>
                  {TIME_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>

                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  backgroundColor: 'transparent', 
                  padding: '4px 0px', 
                  borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer'
                }}>
                  <div style={{ width: '100%' }}>
                    {/* ETIQUETA FANTASMA PARA ALINHAMENTO */}
                    <span style={{ display: 'block', height: '12px', marginBottom: '2px', visibility: 'hidden' }}>Ghost</span>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 500, color: timeOption ? darkColor : mediumColor }}>
                        {timeOption 
                          ? TIME_OPTIONS.find(t => t.id === timeOption)?.label 
                          : 'Selecione...'}
                      </span>
                      <CaretDown size={20} color={mediumColor} weight="bold" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inputs Customizados Direita */}
              <div style={{ 
                flex: 1, display: 'flex', gap: '8px', alignItems: 'flex-end',
                opacity: timeOption === 'custom' ? 1 : 0,
                pointerEvents: timeOption === 'custom' ? 'auto' : 'none',
                transition: 'opacity 0.2s ease'
              }}>
                {/* CAMPO INÍCIO */}
                <div style={{ flex: 1, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                   <span style={{ 
                     display: 'block', fontSize: '10px', fontWeight: 'bold', 
                     color: mediumColor, textTransform: 'uppercase', marginBottom: '2px', height: '12px', lineHeight: '12px'
                   }}>De</span>
                   
                   <input 
                     type="time" 
                     value={startTime}
                     onChange={handleStartTimeChange}
                     onBlur={handleCustomTimeBlur} 
                     style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: 500, textAlign: 'center', color: darkColor }} 
                   />
                </div>
                
                {/* Separador */}
                <span style={{ fontWeight: 'bold', color: mediumColor, paddingBottom: '8px' }}>:</span>
                
                {/* CAMPO FIM */}
                <div style={{ flex: 1, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                   <span style={{ 
                     display: 'block', fontSize: '10px', fontWeight: 'bold', 
                     color: mediumColor, textTransform: 'uppercase', marginBottom: '2px', height: '12px', lineHeight: '12px'
                   }}>Até</span>

                   <input 
                     type="time" 
                     value={endTime}
                     onChange={handleEndTimeChange}
                     onBlur={handleCustomTimeBlur} 
                     style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: 500, textAlign: 'center', color: darkColor }} 
                   />
                </div>
              </div>

            </div>
          </motion.div>

          {/* 4. DETALHES */}
          <motion.div
             initial={false}
             animate={{ 
               height: showDetailsAndButton ? 'auto' : 0, 
               opacity: showDetailsAndButton ? 1 : 0,
               marginBottom: showDetailsAndButton ? 32 : 0
             }}
             style={{ overflow: 'hidden' }}
          >
            <label style={labelStyle}>
              <ListChecks size={16} weight="bold" /> Detalhes
            </label>
            <textarea 
              rows={5}
              placeholder="Adicione notas, links ou observações..."
              style={{ 
                width: '100%', backgroundColor: 'transparent',
                borderRadius: '16px', padding: '20px', 
                border: `1px solid ${lightColor}`,
                fontSize: '16px', color: darkColor, outline: 'none', resize: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </motion.div>
        </div>

        {/* BOTÃO (OVERLAY INFERIOR COM DEGRADÊ) */}
        <AnimatePresence>
          {showDetailsAndButton && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              style={{ 
                position: 'absolute', bottom: 0, left: 0, right: 0, 
                padding: '24px 24px 32px 24px', 
                // O degradê inferior original
                background: 'linear-gradient(to top, #e8e8e8 80%, rgba(232,232,232,0))',
                boxSizing: 'border-box'
              }}
            >
              <button 
                onClick={onClose}
                style={{ 
                  width: '100%', backgroundColor: darkColor, color: 'white', 
                  padding: '18px', borderRadius: '12px',
                  fontSize: '18px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  border: 'none', boxShadow: '0 4px 12px rgba(54,54,54,0.2)'
                }}
              >
                <PencilSimple weight="bold" size={20} />
                Anotar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </>
  )
}