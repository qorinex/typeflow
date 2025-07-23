export type PinTypeScheme = {
  type: string
  default?: unknown
  item?: PinTypeScheme
  entry?: PinTypeScheme
  items?: PinTypeScheme[]
  fields?: { [key: string]: PinTypeScheme }
  slots?: { [key: string]: PinTypeScheme }
  input?: { schema: PinTypeScheme; name?: string }[]
  output?: { schema: PinTypeScheme; name?: string }[]
}

export type WildScheme = PinTypeScheme & { type: 'wildcard'; groupIndex: number }

export interface Pin {
  inlined?: boolean
  linkable?: boolean
  name?: string
  valueSchema: PinTypeScheme
}

export interface PinMeta {
  links: PinLink[]
}

export interface PinLink {
  inIdx?: number
  inNode?: string
  outIdx?: number
  outNode?: string
}

export type Direction = 'out' | 'in'

export function isWildcard(scheme: PinTypeScheme): scheme is WildScheme {
  return scheme.type === 'wildcard' && typeof (scheme as WildScheme).groupIndex === 'number'
}

export function wildcard(groupIndex: number, defaults?: unknown): WildScheme {
  return { type: 'wildcard', groupIndex, default: defaults }
}
