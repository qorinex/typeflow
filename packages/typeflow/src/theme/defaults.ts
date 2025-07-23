import type { PlanTheme } from './types'
import ConstSVG from './icons/const.svg'
import EventSVG from './icons/event.svg'
import FuncSVG from './icons/func.svg'
import ProcSVG from './icons/proc.svg'
import OtherSVG from './icons/other.svg'
import PivotSVG from './icons/pivot.svg'

export const defaultTheme: PlanTheme = {
  pins: {
    exec: { color: '#e4e4e7', label: 'exec' },
    any: { color: '#6b7280', label: 'any' },
    bool: { color: '#eab308', label: 'bool' },
    time: { color: '#a855f7', label: 'time' },
    int: { color: '#3b82f6', label: 'int' },
    float: { color: '#22c55e', label: 'float' },
    str: { color: '#f97316', label: 'str' },
    duration: { color: '#7E22CE', label: 'duration' },
    map: { color: '#ef4444', label: 'map' },
    list: { color: '#6366f1', label: 'list' },
    tuple: { color: '#ec4899', label: 'tuple' },
    struct: { color: '#14b8a6', label: 'struct' },
    'embedded-macro': { color: '#ef4444', label: 'embedded-macro' },
    wildcard: { color: '#6b7280', label: 'wildcard' },
    option: { color: '#14b8a6', label: 'option' },
    result: { color: '#f59e0b', label: 'result' },
  },
  pinFallback: { color: '#6b7280', label: 'any' },
  nodes: {
    const: {
      borderColor: '#7dd3fc',
      headerBackground:
        'linear-gradient(145deg, rgba(125, 211, 252, 0.22) 0%, #18181b 62%)',
      icon: ConstSVG,
    },
    event: {
      borderColor: '#e4e4e7',
      headerBackground:
        'linear-gradient(145deg, rgba(228, 228, 231, 0.16) 0%, #18181b 62%)',
      icon: EventSVG,
    },
    func: {
      borderColor: '#c4b5fd',
      headerBackground:
        'linear-gradient(145deg, rgba(196, 181, 253, 0.22) 0%, #18181b 62%)',
      icon: FuncSVG,
    },
    proc: {
      borderColor: '#fdba74',
      headerBackground:
        'linear-gradient(145deg, rgba(253, 186, 116, 0.2) 0%, #18181b 62%)',
      icon: ProcSVG,
    },
    pivot: {
      borderColor: '#86efac',
      headerBackground:
        'linear-gradient(145deg, rgba(134, 239, 172, 0.18) 0%, #18181b 62%)',
      icon: PivotSVG,
    },
    other: {
      borderColor: '#a1a1aa',
      headerBackground:
        'linear-gradient(145deg, rgba(161, 161, 170, 0.16) 0%, #18181b 62%)',
      icon: OtherSVG,
    },
    default: {
      borderColor: '#71717a',
      headerBackground:
        'linear-gradient(145deg, rgba(113, 113, 122, 0.18) 0%, #18181b 62%)',
      icon: OtherSVG,
    },
  },
  canvas: {
    background: '#09090b',
    patternColor: '#3f3f46',
    patternGap: 20,
    edgeStrokeWidth: 1.5,
    edgeSelectedFilter: 'brightness(1.25)',
  },
  chrome: {
    showLegend: true,
    showWildcardPanel: false,
  },
}
