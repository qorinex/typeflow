export type TypeVarScheme = {
  kind: 'var'
  groupIndex: number
}

export type NamedTypeScheme = {
  type: string
  args?: Record<string, PinTypeScheme>
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

export function typeVar(groupIndex: number): TypeVarScheme {
  return { kind: 'var', groupIndex }
}

/** Build named type scheme: `{ type, args? }` */
export function typeScheme(
  type: string,
  args?: Record<string, PinTypeScheme>,
): NamedTypeScheme {
  const scheme: NamedTypeScheme = { type }
  if (args && Object.keys(args).length > 0) scheme.args = args
  return scheme
}
