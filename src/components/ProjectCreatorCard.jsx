import { useMemo, useState, useLayoutEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, ArrowRight, ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react'
import { PROJECT_ICONS, PROJECT_COLORS, getProjectIconById } from '../constants'

const SEARCH_EQUIVALENTS = {
  // PT -> EN / domain terms
  casa: ['home', 'house'],
  lar: ['home', 'house'],
  usuario: ['user', 'profile', 'account', 'person'],
  pessoas: ['users', 'people', 'group', 'team'],
  pessoa: ['user', 'person'],
  perfil: ['profile', 'user', 'account'],
  configuracao: ['settings', 'gear', 'faders', 'sliders', 'wrench', 'tools'],
  ajuste: ['settings', 'faders', 'sliders', 'tune'],
  busca: ['search', 'find', 'magnifying', 'glass'],
  pesquisar: ['search', 'find', 'magnifying'],
  mensagem: ['message', 'chat', 'mail', 'envelope', 'paperplane'],
  email: ['mail', 'envelope', 'message'],
  trabalho: ['work', 'briefcase', 'office', 'business'],
  dinheiro: ['money', 'cash', 'dollar', 'currency', 'coin', 'wallet'],
  estudo: ['study', 'book', 'graduation', 'school', 'education'],
  viagem: ['travel', 'airplane', 'map', 'pin', 'globe', 'passport'],
  local: ['location', 'map', 'pin', 'place'],
  foto: ['photo', 'image', 'camera', 'picture'],
  musica: ['music', 'note', 'play', 'pause', 'speaker', 'headphones'],
  saude: ['health', 'heart', 'activity', 'pulse', 'stethoscope'],
  comida: ['food', 'fork', 'knife', 'spoon', 'coffee'],
  calendario: ['calendar', 'date', 'event'],
  relogio: ['clock', 'time', 'timer'],

  // EN -> related
  settings: ['config', 'configuration', 'gear', 'faders', 'sliders', 'tools'],
  user: ['profile', 'account', 'person'],
  users: ['people', 'group', 'team', 'community'],
  message: ['chat', 'mail', 'envelope', 'paperplane'],
  travel: ['airplane', 'map', 'pin', 'globe', 'passport'],
  home: ['house', 'dashboard'],
  money: ['cash', 'currency', 'coin', 'wallet', 'dollar'],
  photo: ['camera', 'image', 'picture'],
  search: ['find', 'magnifying', 'glass'],
}

function normalizeSearchText(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function uniqueStrings(list) {
  return [...new Set(list.filter(Boolean))]
}

function stemToken(value) {
  if (!value) return value
  if (value.endsWith('ies') && value.length > 4) return `${value.slice(0, -3)}y`
  if (value.endsWith('es') && value.length > 4) return value.slice(0, -2)
  if (value.endsWith('s') && value.length > 3) return value.slice(0, -1)
  if (value.endsWith('ing') && value.length > 5) return value.slice(0, -3)
  if (value.endsWith('ed') && value.length > 4) return value.slice(0, -2)
  return value
}

function isSubsequence(needle, haystack) {
  if (!needle || !haystack) return false
  let i = 0
  let j = 0
  while (i < needle.length && j < haystack.length) {
    if (needle[i] === haystack[j]) i += 1
    j += 1
  }
  return i === needle.length
}

function boundedLevenshtein(a, b, maxDistance = 2) {
  if (a === b) return 0
  const aLen = a.length
  const bLen = b.length
  if (Math.abs(aLen - bLen) > maxDistance) return maxDistance + 1
  if (aLen === 0) return bLen
  if (bLen === 0) return aLen

  let prev = Array.from({ length: bLen + 1 }, (_, i) => i)
  for (let i = 1; i <= aLen; i += 1) {
    const curr = [i]
    let rowMin = curr[0]
    for (let j = 1; j <= bLen; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const value = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      )
      curr.push(value)
      if (value < rowMin) rowMin = value
    }
    if (rowMin > maxDistance) return maxDistance + 1
    prev = curr
  }
  return prev[bLen]
}

function scoreVariantMatch(variant, entry) {
  if (!variant) return 0
  const compactVariant = variant.replace(/\s+/g, '')

  if (entry.idCompact === compactVariant) return 320
  if (entry.idNormalized === variant) return 320
  if (entry.idCompact.startsWith(compactVariant)) return 250
  if (entry.idNormalized.startsWith(variant)) return 230
  if (entry.tokenSet.has(variant)) return 180
  if (entry.tokens.some((token) => token.startsWith(variant))) return 140
  if (entry.searchNormalized.includes(variant)) return 95
  if (entry.searchCompact.includes(compactVariant)) return 80
  if (entry.tokens.some((token) => isSubsequence(variant, token))) return 60

  if (variant.length >= 4) {
    let bestDistance = 3
    for (const token of entry.tokens) {
      if (Math.abs(token.length - variant.length) > 2) continue
      const distance = boundedLevenshtein(variant, token, 2)
      if (distance < bestDistance) bestDistance = distance
      if (bestDistance === 1) break
    }
    if (bestDistance === 1) return 70
    if (bestDistance === 2) return 48
  }

  return 0
}

function buildTermVariants(term) {
  const normalized = normalizeSearchText(term)
  if (!normalized) return []
  const stemmed = stemToken(normalized)
  const equivalents = SEARCH_EQUIVALENTS[normalized] || []
  const variants = [
    normalized,
    stemmed,
    ...equivalents,
    ...equivalents.map((value) => stemToken(value)),
  ]
  return uniqueStrings(variants.map((value) => normalizeSearchText(value)))
}

export function ProjectCreatorCard({ onSave, onCancel, initialProject = null, submitLabel = 'Criar' }) {
  const MotionDiv = motion.div
  const [step, setStep] = useState(0)
  const nameInputRef = useRef(null)
  
  const [name, setName] = useState(initialProject?.name || '')
  const [iconSearch, setIconSearch] = useState('') // Busca de ícones
  const [colorSearch, setColorSearch] = useState('') // NOVO: Busca de cores
  const [selectedIconId, setSelectedIconId] = useState(initialProject?.iconId || null)
  const [selectedColor, setSelectedColor] = useState(initialProject?.color || PROJECT_COLORS[0].value)
  const [details, setDetails] = useState(initialProject?.details || '')
  
  const defaultIconId = initialProject?.iconId || 'Plus'
  const activeIconObj = PROJECT_ICONS.find(i => i.id === selectedIconId)
  const ActiveIconComponent = activeIconObj ? activeIconObj.icon : null

  const iconSearchIndex = useMemo(() => {
    return PROJECT_ICONS.map((icon, order) => {
      const idNormalized = normalizeSearchText(icon.id)
      const tagsText = Array.isArray(icon.tags) ? icon.tags.join(' ') : (icon.tags || '')
      const categoriesText = Array.isArray(icon.categories) ? icon.categories.join(' ') : (icon.categories || '')
      const aliasesText = Array.isArray(icon.aliases) ? icon.aliases.join(' ') : (icon.aliases || '')
      const baseSearch = normalizeSearchText(
        `${icon.id} ${icon.name || ''} ${tagsText} ${categoriesText} ${aliasesText}`
      )
      const baseTokens = baseSearch.split(' ').filter(Boolean)
      const tokenVariants = uniqueStrings(
        baseTokens.flatMap((token) => {
          const equivalents = SEARCH_EQUIVALENTS[token] || []
          return [token, stemToken(token), ...equivalents, ...equivalents.map(stemToken)]
        }).map((token) => normalizeSearchText(token))
      )
      const tokens = uniqueStrings([...baseTokens, ...tokenVariants])
      const searchNormalized = uniqueStrings([baseSearch, ...tokens]).join(' ')

      return {
        icon,
        order,
        idNormalized,
        idCompact: idNormalized.replace(/\s+/g, ''),
        searchNormalized,
        searchCompact: searchNormalized.replace(/\s+/g, ''),
        tokens,
        tokenSet: new Set(tokens),
      }
    })
  }, [])
  
  // Busca ranqueada para ícones (MANTIDA)
  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return iconSearchIndex.slice(0, 100).map((entry) => entry.icon)

    const normalizedQuery = normalizeSearchText(iconSearch)
    const terms = normalizedQuery.split(' ').filter(Boolean)
    if (terms.length === 0) return iconSearchIndex.slice(0, 100).map((entry) => entry.icon)

    const termVariants = terms.map(buildTermVariants).filter((variants) => variants.length > 0)
    const compactQuery = normalizedQuery.replace(/\s+/g, '')

    return iconSearchIndex
      .map((entry) => {
        let score = 0
        let matchedTerms = 0

        for (const variants of termVariants) {
          let bestTermScore = 0
          for (const variant of variants) {
            bestTermScore = Math.max(bestTermScore, scoreVariantMatch(variant, entry))
          }

          if (bestTermScore > 0) {
            matchedTerms += 1
            score += bestTermScore
          } else score -= 40
        }

        if (matchedTerms === 0) return null
        if (matchedTerms < Math.ceil(termVariants.length / 2)) return null

        if (entry.idCompact === compactQuery) score += 280
        else if (entry.idCompact.startsWith(compactQuery)) score += 140

        if (matchedTerms === termVariants.length) score += 110
        else score += matchedTerms * 24

        return { icon: entry.icon, score, order: entry.order }
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return a.order - b.order
      })
      .slice(0, 100)
      .map((entry) => entry.icon)
  }, [iconSearch, iconSearchIndex])

  // NOVO: Busca simples para cores (Filtra por tag)
  const filteredColors = useMemo(() => {
    if (!colorSearch.trim()) return PROJECT_COLORS
    const search = normalizeSearchText(colorSearch)
    // Filtra cores onde as tags contenham o termo buscado
    return PROJECT_COLORS.filter(colorObj => colorObj.tags.includes(search))
  }, [colorSearch])

  useLayoutEffect(() => {
    if (step !== 0) return
    const input = nameInputRef.current
    if (input) {
      input.focus({ preventScroll: true })
    }
  }, [step])

  const handleCommitName = () => {
    if (name.trim().length > 0) {
      setStep(1) 
    }
  }

  const handleBlurName = () => {
    if (step === 0) {
      if (name.trim().length === 0) {
        if (!initialProject) onCancel()
      } else {
        handleCommitName()
      }
    }
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur() 
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', minWidth: 0 }}>
      <style>{`
        .project-input::placeholder { color: #919191 !important; opacity: 1; }
        .project-input::-webkit-input-placeholder { color: #919191 !important; opacity: 1; }
        .project-input::-moz-placeholder { color: #919191 !important; opacity: 1; }
        .icon-search-input,
        .icon-search-input:focus,
        .icon-search-input:active {
          background-color: transparent !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -webkit-tap-highlight-color: transparent;
        }
        .icon-search-input:-webkit-autofill,
        .icon-search-input:-webkit-autofill:hover,
        .icon-search-input:-webkit-autofill:focus,
        .icon-search-input:-webkit-autofill:active {
          -webkit-text-fill-color: #121212 !important;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          transition: background-color 9999s ease-out 0s;
        }
        .project-description-input,
        .project-description-input:focus,
        .project-description-input:active {
          background-color: transparent !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -webkit-tap-highlight-color: transparent;
        }
        .project-description-input:-webkit-autofill,
        .project-description-input:-webkit-autofill:hover,
        .project-description-input:-webkit-autofill:focus,
        .project-description-input:-webkit-autofill:active {
          transition: background-color 9999s ease-out 0s;
        }
        /* Hide scrollbar for icon list but keep functionality */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 1. O CARD (VISUALIZADOR) */}
      <div style={{ width: '100%', height: '96px', backgroundColor: 'transparent', borderRadius: '24px', padding: '0 24px', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '16px', boxSizing: 'border-box' }}>
        <div onClick={() => step >= 1 && setStep(1)} style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, backgroundColor: step >= 3 ? selectedColor : '#e0e0e0', color: step >= 3 ? 'white' : (selectedIconId ? '#121212' : '#919191'), display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: step >= 1 ? 'pointer' : 'default', transition: 'all 0.3s ease' }}>
           {ActiveIconComponent ? <ActiveIconComponent size={24} weight="regular" /> : <Plus size={24} weight="bold" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
           <input ref={nameInputRef} autoFocus type="text" className="project-input" placeholder="Qual é o nome do projeto?" value={name} onChange={(e) => setName(e.target.value)} onBlur={handleBlurName} onKeyDown={handleNameKeyDown} disabled={step >= 2} style={{ width: '100%', border: 'none', outline: 'none', margin: 0, padding: 0, textAlign: 'left', fontSize: '18px', fontWeight: 600, lineHeight: '1.2', color: '#121212', background: 'transparent', textOverflow: 'ellipsis', opacity: 1 }} />
        </div>
      </div>

      {/* 2. MENUS FLUTUANTES */}
      <AnimatePresence mode="wait">
        
        {/* PASSO 1: ESCOLHER ÍCONE (COM BUSCA) */}
        {step === 1 && (
          <MotionDiv key="icon-picker-wrapper" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: '100%', boxSizing: 'border-box' }}>
            
            {/* BALÃO DE FALA */}
            <div style={{ backgroundColor: 'transparent', padding: '16px', borderRadius: '24px', border: '1px solid #CCCCCC', boxShadow: 'none', width: '100%', boxSizing: 'border-box', position: 'relative', marginTop: '0px' }}>
              <div style={{ position: 'absolute', top: '-9px', left: '40px', width: '16px', height: '16px', backgroundColor: '#e8e8e8', borderTop: '1px solid #CCCCCC', borderLeft: '1px solid #CCCCCC', transform: 'rotate(45deg)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* CAMPO DE BUSCA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', border: 'none', borderRadius: '12px', padding: '8px 12px' }}>
                  <MagnifyingGlass size={18} color="#919191" />
                  <input 
                    className="icon-search-input"
                    type="text" 
                    placeholder="Buscar ícone..." 
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#121212', width: '100%', appearance: 'none', WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent' }}
                  />
                </div>

                {/* LISTA DE ÍCONES */}
                <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {filteredIcons.length > 0 ? (
                    filteredIcons.map((item) => (
                      <div key={item.id} onClick={() => setSelectedIconId(item.id)} style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, backgroundColor: 'transparent', border: selectedIconId === item.id ? '1px solid #363636' : '1px solid #d9d9d9', color: selectedIconId === item.id ? '#121212' : '#4f4f4f', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 160ms ease, color 160ms ease', WebkitTapHighlightColor: 'transparent' }}>
                        <item.icon size={24} weight="regular" />
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: '#919191', padding: '8px 0' }}>Nenhum ícone encontrado.</span>
                  )}
                </div>
              </div>
            </div>

            {/* BOTÕES DE NAVEGAÇÃO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
               <button onClick={() => setStep(0)} style={{ background: 'transparent', border: 'none', padding: '8px 0', color: '#121212', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><ArrowLeft weight="bold" size={16} /> Voltar</button>
               <button onClick={() => setStep(2)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#121212', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>Próximo <ArrowRight weight="bold" /></button>
            </div>
          </MotionDiv>
        )}

        {/* PASSO 2: DETALHES */}
        {step === 2 && (
          <MotionDiv key="details-input" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#919191', textTransform: 'uppercase', display: 'block' }}>Descrição do Projeto</span>
             <textarea className="project-description-input" rows={2} placeholder="Do que se trata esse projeto?" value={details} onChange={(e) => setDetails(e.target.value)} autoFocus style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid #CCCCCC', borderRadius: '16px', padding: '16px', fontSize: '14px', color: '#121212', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', WebkitTapHighlightColor: 'transparent' }} />
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', padding: '8px 0', color: '#121212', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><ArrowLeft weight="bold" size={16} /> Voltar</button>
                <button onClick={() => setStep(3)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#121212', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>Próximo <ArrowRight weight="bold" /></button>
             </div>
          </MotionDiv>
        )}

        {/* PASSO 3: COR & CRIAR (COM BUSCA DE CORES) */}
        {step === 3 && (
          <MotionDiv key="color-picker" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: 'transparent', padding: '16px', borderRadius: '24px', border: '1px solid #CCCCCC', boxShadow: 'none', width: '100%', boxSizing: 'border-box', position: 'relative', marginTop: '0px' }}>
              <div style={{ position: 'absolute', top: '-9px', left: '40px', width: '16px', height: '16px', backgroundColor: '#e8e8e8', borderTop: '1px solid #CCCCCC', borderLeft: '1px solid #CCCCCC', transform: 'rotate(45deg)' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* CAMPO DE BUSCA DE COR (NOVO) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', border: 'none', borderRadius: '12px', padding: '8px 12px' }}>
                  <MagnifyingGlass size={18} color="#919191" />
                  <input 
                    className="icon-search-input"
                    type="text" 
                    placeholder="Buscar cor (ex: vermelho, dark)..." 
                    value={colorSearch}
                    onChange={(e) => setColorSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#121212', width: '100%', appearance: 'none', WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent' }}
                  />
                </div>

                {/* LISTA DE CORES (ADAPTADA PARA OBJETOS) */}
                <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {filteredColors.length > 0 ? (
                    filteredColors.map((colorObj) => {
                      const isSelected = selectedColor === colorObj.value
                      return (
                        <div 
                          key={colorObj.value} 
                          onClick={() => setSelectedColor(colorObj.value)} 
                          style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, 
                            backgroundColor: colorObj.value, cursor: 'pointer', 
                            border: '1.6px solid transparent', 
                            boxShadow: 'none', boxSizing: 'border-box', 
                            transition: 'border-color 160ms ease', 
                            borderColor: isSelected ? '#363636' : (colorObj.value.toLowerCase() === '#ffffff' ? '#e5e5e5' : 'transparent'),
                            WebkitTapHighlightColor: 'transparent' 
                          }} 
                        />
                      )
                    })
                  ) : (
                    <span style={{ fontSize: '12px', color: '#919191', padding: '8px 0' }}>Nenhuma cor encontrada.</span>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
               <button onClick={() => setStep(2)} style={{ background: 'transparent', border: 'none', padding: '8px 0', color: '#121212', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><ArrowLeft weight="bold" size={16} /> Voltar</button>
               <button onClick={() => onSave({ name: name.trim(), iconId: selectedIconId || defaultIconId, icon: getProjectIconById(selectedIconId || defaultIconId), color: selectedColor, details: details.trim() })} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#121212', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>{initialProject ? <Check weight="bold" size={18} /> : <Plus weight="bold" size={18} />} {submitLabel}</button>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}
