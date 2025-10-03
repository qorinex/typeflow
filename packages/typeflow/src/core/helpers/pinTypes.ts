import { isTypeVar, type PinTypeScheme } from '../types/pin'
import { getSchemeChildren } from './schemeTree'
import { applyBindings, schemesEqual } from '../inference/unify'

/** Formats a type without a pack. Prefer TypeRegistry.format when using a pack */
export function getTypeString(scheme: PinTypeScheme, indent = 0): string {
  if (isTypeVar(scheme)) return `var(${scheme.groupIndex})`

  const children = getSchemeChildren(scheme)
  if (!children.length) return scheme.type

  const pad = '  '.repeat(indent)
  const nested = children.some((c) => getSchemeChildren(c.scheme).length > 0)

  if (nested) {
    const parts = children.map(
      (c) => `${pad}  ${c.key}: ${getTypeString(c.scheme, indent + 1)}`,
    )
    return `${scheme.type}{\n${parts.join(',\n')}\n${pad}}`
  }

  const parts = children.map((c) => `${c.key}: ${getTypeString(c.scheme)}`)
  return `${scheme.type}{${parts.join(', ')}}`
}

export function validateSchemes(source: PinTypeScheme, target: PinTypeScheme): boolean {
  if (isTypeVar(source) || isTypeVar(target)) return true
  if (source.type === 'any' || target.type === 'any') return true
  if (source.type !== target.type) return false

  const a = getSchemeChildren(source)
  const b = getSchemeChildren(target)
  if (!a.length && !b.length) return true

  const byA = Object.fromEntries(a.map((c) => [c.key, c.scheme]))
  for (const c of b) {
    if (byA[c.key] && !validateSchemes(byA[c.key], c.scheme)) return false
  }

  const byB = Object.fromEntries(b.map((c) => [c.key, c.scheme]))
  for (const c of a) {
    if (byB[c.key] && !validateSchemes(c.scheme, byB[c.key])) return false
  }
  return true
}

export function resolveScheme(
  scheme: PinTypeScheme,
  nodeId: string,
  nodeWildcards: { [nodeId: string]: { [groupIndex: number]: PinTypeScheme } },
): PinTypeScheme {
  try {
    return applyBindings(scheme, nodeWildcards[nodeId])
  } catch {
    return scheme
  }
}

export { schemesEqual }
