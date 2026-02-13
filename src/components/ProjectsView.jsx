import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from '@phosphor-icons/react'
import { ProjectCreatorCard } from './ProjectCreatorCard'

export function ProjectsView({ projects, setProjects }) {
  const [isCreating, setIsCreating] = useState(false)

  const handleSaveProject = (newProject) => {
    setProjects([...projects, newProject])
    setIsCreating(false)
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', boxSizing: 'border-box', padding: '60px 24px 80px 24px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ fontSize: '1.25rem', color: '#121212', fontWeight: 400, letterSpacing: '-0.025em' }}>Projetos</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* LISTA DE PROJETOS */}
        {projects.map((project, index) => (
          <div key={index} style={{ width: '100%', height: '96px', borderRadius: '24px', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', boxShadow: 'none', boxSizing: 'border-box' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: project.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <project.icon size={24} weight="regular" />
            </div>
            
            {/* AJUSTE DE POSICIONAMENTO E ESPAÇAMENTO */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0px' }}>
              <h3 style={{ 
                fontSize: '24px', fontWeight: 700, color: '#121212', 
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', 
                lineHeight: '1.2', // Levemente mais relaxado
                marginTop: '6px',  // Empurra o título mais para baixo
                marginBottom: '0px' 
              }}>
                {project.name}
              </h3>
              {project.details && (
                <p style={{ 
                  fontSize: '14px', color: '#919191', 
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', 
                  marginTop: '2px', // Cria o "respiro" entre título e descrição
                  lineHeight: '1.4' 
                }}>
                  {project.details}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* SLOT DE CRIAÇÃO */}
        <AnimatePresence mode="wait">
          {!isCreating ? (
            <motion.button 
              key="create-btn"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreating(true)}
              className="active:scale-95 transition-transform"
              style={{ width: '100%', height: '96px', borderRadius: '24px', backgroundColor: 'transparent', border: 'none', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', cursor: 'pointer', flexShrink: 0, boxSizing: 'border-box', appearance: 'none', WebkitAppearance: 'none', outline: 'none', WebkitTapHighlightColor: 'transparent' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#919191', flexShrink: 0 }}>
                <Plus size={24} weight="bold" />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 600, lineHeight: '1.2', color: '#919191' }}>Criar Novo Projeto</span>
            </motion.button>
          ) : (
            <ProjectCreatorCard onSave={handleSaveProject} onCancel={() => setIsCreating(false)} />
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}