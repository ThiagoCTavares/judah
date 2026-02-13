import * as AllIcons from '@phosphor-icons/react'
import { icons as PHOSPHOR_CORE_ICONS } from '@phosphor-icons/core'

// --- SINÔNIMOS EM INGLÊS (Para corrigir a busca) ---
const ENGLISH_ALIASES = {
  // Communication
  Envelope: 'email mail message letter',
  PaperPlane: 'send',
  Chat: 'message talk speak bubble',
  Phone: 'call telephone contact',
  
  // Settings & Tools
  Gear: 'settings config preferences options mechanical',
  Wrench: 'fix tool repair settings',
  Faders: 'settings levels config',
  Trash: 'delete remove bin garbage',
  Pencil: 'edit write draw change',
  MagnifyingGlass: 'search find zoom',

  // Work & Finance
  Briefcase: 'work job office business portfolio',
  CurrencyDollar: 'money cash price cost finance',
  CreditCard: 'pay money buy',
  TrendUp: 'growth analytics chart',
  Target: 'goal objective focus',

  // Education & Science
  GraduationCap: 'school study learn university college student',
  Book: 'read library learn',
  Atom: 'science physics core',
  Flask: 'chemistry science lab',

  // Media
  Image: 'photo picture gallery',
  Play: 'start music video',
  Pause: 'stop wait',
  Camera: 'photo picture',

  // Interface
  House: 'home dashboard main',
  User: 'profile account person human',
  Users: 'group team community people',
  List: 'menu burger options',
  SignIn: 'login log enter',
  SignOut: 'logout exit leave',
  Warning: 'alert error danger',
  Check: 'success done finish ok',
  
  // Travel & Location
  Airplane: 'travel flight holiday vacation',
  MapPin: 'location place address spot',
  Globe: 'world internet language',
}

function uniqueList(values) {
  return [...new Set(values.filter(Boolean))]
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
export const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
export const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const DAILY_TASKS = [
  { id: 1, time: '08:30', icon: AllIcons.Coffee, color: '#f59e0b' },   
  { id: 2, time: '10:00', icon: AllIcons.Code, color: '#3b82f6' },     
  { id: 3, time: '14:30', icon: AllIcons.BookOpen, color: '#ec4899' }, 
  { id: 4, time: '18:00', icon: AllIcons.Barbell, color: '#10b981' },  
  { id: 5, time: '20:00', icon: AllIcons.Sun, color: '#8b5cf6' },      
]

const PHOSPHOR_META_BY_PASCAL_NAME = new Map(
  PHOSPHOR_CORE_ICONS.map((meta) => [meta.pascal_name, meta])
)

// --- GERADOR DE ÍCONES OTIMIZADO ---
export const PROJECT_ICONS = Object.entries(AllIcons)
  .filter(([name, IconComponent]) => 
    (typeof IconComponent === 'function' || typeof IconComponent === 'object') &&
    name !== 'IconBase' &&
    name !== 'IconContext' &&
    name !== 'SSR' &&
    name !== 'ContextProvider' &&
    name !== 'default' &&
    !name.endsWith('Icon')
  )
  .map(([name, IconComponent]) => {
    const meta = PHOSPHOR_META_BY_PASCAL_NAME.get(name)
    const naturalName = name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
    const fallbackAlias = ENGLISH_ALIASES[name] || ''
    const aliasList = meta?.alias ? [meta.alias.name, meta.alias.pascal_name] : []
    const categoryList = uniqueList([...(meta?.categories || [])])
    const tagList = uniqueList([...(meta?.tags || [])])
    const searchAliases = uniqueList([
      ...aliasList,
      fallbackAlias,
      naturalName,
      name,
    ])

    return {
      id: name,
      name: meta?.name || '',
      icon: IconComponent,
      categories: categoryList,
      aliases: searchAliases,
      tags: tagList,
    }
  })
  .sort((a, b) => {
    const hasMetaA = PHOSPHOR_META_BY_PASCAL_NAME.has(a.id)
    const hasMetaB = PHOSPHOR_META_BY_PASCAL_NAME.has(b.id)
    if (hasMetaA && !hasMetaB) return -1
    if (!hasMetaA && hasMetaB) return 1
    return a.id.localeCompare(b.id)
  })

// --- MEGA PALETA DE CORES EXPANDIDA (Pesquisável) ---
export const PROJECT_COLORS = [
  // --- CLÁSSICOS ---
  { value: '#121212', tags: 'preto black dark escuro noite midnight' },
  { value: '#ffffff', tags: 'branco white neve clean clear light' },
  
  // --- CINZAS & NEUTROS (Grays) ---
  { value: '#f4f4f5', tags: 'cinza claro light gray gelo zinc 100' },
  { value: '#d4d4d8', tags: 'cinza gray prata silver zinc 300' },
  { value: '#a1a1aa', tags: 'cinza medio gray medium zinc 400' },
  { value: '#71717a', tags: 'cinza escuro dark gray chumbo zinc 500' },
  { value: '#3f3f46', tags: 'cinza grafite dark gray metal zinc 700' },
  { value: '#18181b', tags: 'preto fosco black matte zinc 900' },
  { value: '#57534e', tags: 'cinza quente warm gray pedra stone' },
  { value: '#334155', tags: 'cinza azulado slate blue gray' },

  // --- VERMELHOS (Reds) ---
  { value: '#fca5a5', tags: 'vermelho claro light red' },
  { value: '#ef4444', tags: 'vermelho red erro perigo danger hot' },
  { value: '#dc2626', tags: 'vermelho forte red bold' },
  { value: '#991b1b', tags: 'vermelho escuro dark red sangue vinho' },
  { value: '#450a0a', tags: 'vermelho profundo deep red' },

  // --- LARANJAS (Oranges) ---
  { value: '#fdba74', tags: 'laranja claro light orange pessego' },
  { value: '#f97316', tags: 'laranja orange warning aviso' },
  { value: '#ea580c', tags: 'laranja forte orange bold' },
  { value: '#9a3412', tags: 'laranja escuro dark orange terra rust' },

  // --- AMARELOS & ÂMBAR (Yellows) ---
  { value: '#fde047', tags: 'amarelo claro light yellow limao' },
  { value: '#eab308', tags: 'amarelo yellow gold ouro sol warning' },
  { value: '#ca8a04', tags: 'amarelo escuro dark yellow ocre' },
  { value: '#d97706', tags: 'ambar amber mel honey' },
  { value: '#78350f', tags: 'marrom brown madeira wood' },

  // --- VERDES (Greens) ---
  { value: '#bef264', tags: 'verde limao lime neon' },
  { value: '#86efac', tags: 'verde claro light green menta mint' },
  { value: '#4ade80', tags: 'verde green' },
  { value: '#22c55e', tags: 'verde sucesso success nature natureza' },
  { value: '#16a34a', tags: 'verde forte green bold' },
  { value: '#15803d', tags: 'verde escuro dark green floresta forest' },
  { value: '#14532d', tags: 'verde profundo deep green' },
  { value: '#10b981', tags: 'esmeralda emerald' },
  { value: '#065f46', tags: 'esmeralda escuro dark emerald' },
  { value: '#14b8a6', tags: 'teal verde azulado' },

  // --- CIANO & CÉU (Cyans & Sky) ---
  { value: '#67e8f9', tags: 'ciano claro light cyan' },
  { value: '#06b6d4', tags: 'ciano cyan agua piscina' },
  { value: '#0e7490', tags: 'ciano escuro dark cyan' },
  { value: '#164e63', tags: 'ciano petroleo dark cyan' },
  { value: '#7dd3fc', tags: 'ceu claro light sky' },
  { value: '#0ea5e9', tags: 'ceu sky azul' },
  { value: '#0369a1', tags: 'ceu escuro dark sky' },

  // --- AZUIS (Blues) ---
  { value: '#93c5fd', tags: 'azul claro light blue bebe' },
  { value: '#3b82f6', tags: 'azul blue primary' },
  { value: '#2563eb', tags: 'azul forte blue bold' },
  { value: '#1d4ed8', tags: 'azul real royal blue' },
  { value: '#1e3a8a', tags: 'azul escuro dark blue marinho navy' },
  { value: '#172554', tags: 'azul profundo deep blue noite' },

  // --- ÍNDIGO & VIOLETA (Indigos & Violets) ---
  { value: '#a5b4fc', tags: 'indigo claro light' },
  { value: '#6366f1', tags: 'indigo roxo' },
  { value: '#4338ca', tags: 'indigo forte bold' },
  { value: '#312e81', tags: 'indigo escuro dark' },
  { value: '#c4b5fd', tags: 'violeta claro light violet lavanda' },
  { value: '#8b5cf6', tags: 'violeta violet lilas' },
  { value: '#6d28d9', tags: 'violeta forte bold' },
  { value: '#4c1d95', tags: 'violeta escuro dark violet' },

  // --- ROXOS & FUCSIA (Purples) ---
  { value: '#d8b4fe', tags: 'roxo claro light purple' },
  { value: '#a855f7', tags: 'roxo purple' },
  { value: '#7e22ce', tags: 'roxo forte bold purple' },
  { value: '#581c87', tags: 'roxo escuro dark purple uva' },
  { value: '#f0abfc', tags: 'fucsia claro light fuchsia' },
  { value: '#d946ef', tags: 'fucsia fuchsia magenta' },
  { value: '#a21caf', tags: 'fucsia forte bold' },
  { value: '#701a75', tags: 'fucsia escuro dark' },

  // --- ROSAS (Pinks) ---
  { value: '#f9a8d4', tags: 'rosa claro light pink bebe' },
  { value: '#ec4899', tags: 'rosa pink amor love' },
  { value: '#db2777', tags: 'rosa forte bold pink' },
  { value: '#9d174d', tags: 'rosa escuro dark pink' },
  { value: '#fda4af', tags: 'rose claro light' },
  { value: '#e11d48', tags: 'rose rubi' },
  { value: '#881337', tags: 'rose escuro dark vinho' },
]