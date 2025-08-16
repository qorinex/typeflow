export type TypeVarScheme = {
  kind: 'var'
  groupIndex: number
  default?: unknown
}

export type NamedTypeScheme = {
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

export type PinTypeScheme = TypeVarScheme | NamedTypeScheme

// stored on in-pins only
export interface PinLink {
  inNode: string
  inIdx: number
  outNode: string
  outIdx: number
}

export interface Pin {
  linkable?: boolean
  name?: string
  valueSchema: PinTypeScheme
  links: PinLink[]
}

export type Direction = 'out' | 'in'

export function isTypeVar(scheme: PinTypeScheme): scheme is TypeVarScheme {
  return (scheme as TypeVarScheme).kind === 'var'
}

export function isNamedType(scheme: PinTypeScheme): scheme is NamedTypeScheme {
  return !isTypeVar(scheme)
}

export function schemeTypeTag(scheme: PinTypeScheme): string {
  return isTypeVar(scheme) ? 'var' : scheme.type
}

export function typeVar(groupIndex: number, defaults?: unknown): TypeVarScheme {
  return { kind: 'var', groupIndex, default: defaults }
}
