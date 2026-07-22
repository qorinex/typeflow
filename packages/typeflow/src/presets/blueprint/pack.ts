import type { PinTypeScheme } from '../../core'
import { typeScheme } from '../../core'
import type { TypePack } from '../../typeRegistry'

export type BlueprintPinIconKind =
  | 'primitive'
  | 'list'
  | 'map'
  | 'struct'
  | 'tuple'
  | 'exec'

const icon = (kind: BlueprintPinIconKind) => kind

/**
 * Blueprint vocabulary: names, colors, icons, formatters.
 */
export const blueprintTypePack: TypePack = {
  id: 'blueprint',
  types: {
    exec: { color: '#e4e4e7', label: 'exec', icon: icon('exec') },
    any: { color: '#6b7280', label: 'any', icon: icon('primitive') },
    bool: { color: '#eab308', label: 'bool', icon: icon('primitive') },
    time: { color: '#a855f7', label: 'time', icon: icon('primitive') },
    int: { color: '#3b82f6', label: 'int', icon: icon('primitive') },
    float: { color: '#22c55e', label: 'float', icon: icon('primitive') },
    str: { color: '#f97316', label: 'str', icon: icon('primitive') },
    duration: { color: '#7E22CE', label: 'duration', icon: icon('primitive') },
    var: { color: '#6b7280', label: 'var', icon: icon('primitive') },
    'embedded-macro': {
      color: '#ef4444',
      label: 'embedded-macro',
      icon: icon('primitive'),
    },

    list: {
      color: '#6366f1',
      label: 'list',
      icon: icon('list'),
      colorFrom: 'item',
      format: (p) => (p.item ? `list[${p.item}]` : 'list'),
    },
    map: {
      color: '#0ea5e9',
      label: 'map',
      icon: icon('map'),
      format: (p) => {
        const key = p.key ?? 'str'
        const value = p.value ?? p.entry
        return value ? `map[${key}, ${value}]` : 'map'
      },
    },
    tuple: {
      color: '#ec4899',
      label: 'tuple',
      icon: icon('tuple'),
      format: (p) => {
        const keys = Object.keys(p).sort((a, b) => Number(a) - Number(b))
        return `tuple[${keys.map((k) => p[k]).join(', ')}]`
      },
    },
    struct: {
      color: '#14b8a6',
      label: 'struct',
      icon: icon('struct'),
      format: (p) => {
        const body = Object.entries(p)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        return `struct{${body}}`
      },
    },
  },
}

/** Sugar constructors */
export const bp = {
  t: (type: string, args?: Record<string, PinTypeScheme>) => typeScheme(type, args),

  list: (item: PinTypeScheme) => typeScheme('list', { item }),
  map: (keyOrValue: PinTypeScheme, value?: PinTypeScheme) =>
    value
      ? typeScheme('map', { key: keyOrValue, value })
      : typeScheme('map', { key: { type: 'str' }, value: keyOrValue }),

  tuple: (...items: PinTypeScheme[]) =>
    typeScheme(
      'tuple',
      Object.fromEntries(items.map((item, i) => [String(i), item])),
    ),

  struct: (fields: Record<string, PinTypeScheme>) => typeScheme('struct', fields),
} as const
