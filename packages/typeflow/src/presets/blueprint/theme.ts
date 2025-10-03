import { createTheme, type FlowTheme } from '../../theme'
import { pinsFromPacks } from '../../typeRegistry'
import { blueprintTypePack } from './pack'
import ConstSVG from './icons/const.svg'
import EventSVG from './icons/event.svg'
import FuncSVG from './icons/func.svg'
import ProcSVG from './icons/proc.svg'
import OtherSVG from './icons/other.svg'
import PivotSVG from './icons/pivot.svg'

export type BlueprintNodeClass =
  | 'const'
  | 'event'
  | 'func'
  | 'proc'
  | 'pivot'
  | 'other'
  | 'default'

export function createBlueprintTheme(): FlowTheme {
  return createTheme({
    pins: pinsFromPacks([blueprintTypePack]),
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
  })
}
