import type { FlowTheme } from './types'

export const defaultTheme: FlowTheme = {
  pins: {
    any: { color: '#6b7280', label: 'any' },
    var: { color: '#6b7280', label: 'var' },
  },
  pinFallback: { color: '#6b7280', label: 'any' },
  nodes: {
    default: {
      borderColor: '#71717a',
      headerBackground:
        'linear-gradient(145deg, rgba(113, 113, 122, 0.18) 0%, #18181b 62%)',
    },
  },
  canvas: {
    background: '#09090b',
    patternColor: '#3f3f46',
    patternGap: 20,
    edgeStrokeWidth: 1.5,
    edgeSelectedFilter: 'brightness(1.25)',
  },
}
