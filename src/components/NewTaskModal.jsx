import { createElement, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, CaretDown, Hash, PuzzlePiece, ListChecks, PencilSimple } from '@phosphor-icons/react'
import { getProjectIconById } from '../constants'
import { formatDateKey } from '../task-utils'

// Opções de Horário
const TIME_OPTIONS = [
  { id: 'none', label: 'Sem horário' },
  { id: 'morning', label: 'Manhã' },
  { id: 'afternoon', label: 'Tarde' },
  { id: 'night', label: 'Noite' },
  { id: 'custom', label: 'Personalizado' }
]

const MotionDiv = motion.div

function createTaskId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function NewTaskModal({ onClose, onSaveTask, projects, selectedDate }) {
  // ESTADOS
  const [taskName, setTaskName] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [timeOption, setTimeOption] = useState(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [details, setDetails] = useState('')
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
  const darkColor = 'var(--judah-dark)'
  const mediumColor = 'var(--judah-medium)'
  const lightColor = 'var(--judah-light)'
  const selectedProjectData = useMemo(
    () => projects.find((project) => project.id === selectedProject) || null,
    [projects, selectedProject]
  )
  const selectedProjectIconNode = useMemo(() => {
    if (!selectedProjectData) return null
    return createElement(getProjectIconById(selectedProjectData.iconId), {
      size: 16,
      weight: 'regular',
    })
  }, [selectedProjectData])

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

  const handleSave = () => {
    if (!taskName.trim() || !timeOption) return

    onSaveTask({
      id: createTaskId(),
      name: taskName.trim(),
      dateKey: formatDateKey(selectedDate),
      projectId: selectedProject === 'none' ? null : selectedProject,
      timeOption,
      startTime: timeOption === 'custom' ? startTime : '',
      endTime: timeOption === 'custom' ? endTime : '',
      details: details.trim(),
      createdAt: new Date().toISOString(),
      status: 'active',
      completedAt: null,
    })
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
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="modal-backdrop"
      />

      <MotionDiv
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="modal-sheet"
        style={{ 
          height: '70vh', 
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
           <X size={18} color="var(--judah-pure)" weight="bold" />
        </div>

        {/* BODY (ÁREA DE SCROLL) */}
        <div className="modal-sheet__body">
          
          {/* 1. NOME */}
          <div style={sectionStyle}>
            <label style={labelStyle}>
              <Hash size={16} weight="bold" /> Task
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
          <MotionDiv
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
                <option value="" disabled>Selecione...</option>
                <option value="none">Sem projeto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>

              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'transparent', padding: '8px 0px', borderRadius: '0px',
                width: '100%', boxSizing: 'border-box', borderBottom: '1px solid rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  {selectedProjectData && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: selectedProjectData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                      {selectedProjectIconNode}
                    </div>
                  )}
                  <span style={{ fontSize: '18px', fontWeight: 500, color: selectedProject ? darkColor : mediumColor, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedProject === 'none'
                      ? 'Sem projeto'
                      : selectedProjectData
                        ? selectedProjectData.name
                        : 'Selecione um projeto...'}
                  </span>
                </div>
                <CaretDown size={20} color={mediumColor} weight="bold" />
              </div>
            </div>
            {projects.length === 0 && (
              <p style={{ margin: '12px 0 0 0', fontSize: '0.875rem', color: mediumColor }}>
                Ainda não existe nenhum projeto salvo. Você pode continuar usando "Sem projeto".
              </p>
            )}
          </MotionDiv>

          {/* 3. HORÁRIO */}
          <MotionDiv
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
          </MotionDiv>

          {/* 4. DETALHES */}
          <MotionDiv
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
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              style={{ 
                width: '100%', backgroundColor: 'transparent',
                borderRadius: '16px', padding: '20px', 
                border: `1px solid ${lightColor}`,
                fontSize: '16px', color: darkColor, outline: 'none', resize: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </MotionDiv>
        </div>

        {/* BOTÃO (OVERLAY INFERIOR COM DEGRADÊ) */}
        <AnimatePresence>
          {showDetailsAndButton && (
            <MotionDiv
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="modal-sheet__footer"
            >
              <button 
                onClick={handleSave}
                style={{ 
                  width: '100%', backgroundColor: darkColor, color: 'var(--judah-pure)', 
                  padding: '18px', borderRadius: '12px',
                  fontSize: '18px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  border: 'none', boxShadow: '0 4px 12px rgba(54,54,54,0.2)'
                }}
              >
                <PencilSimple weight="bold" size={20} />
                Anotar
              </button>
            </MotionDiv>
          )}
        </AnimatePresence>

      </MotionDiv>
    </>
  )
}
