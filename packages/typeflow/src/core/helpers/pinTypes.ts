import { isTypeVar, type PinTypeScheme } from '../types/pin'
import { getSchemeChildren } from './schemeTree'
import { applyBindings, findWildcards, schemesEqual } from '../inference/unify'

export function getTypeString(scheme: PinTypeScheme, indent = 0): string {
  if (isTypeVar(scheme)) return `var(${scheme.groupIndex})`

  const children = getSchemeChildren(scheme)
  if (!children.length) return scheme.type

  const pad = '  '.repeat(indent)

  if (scheme.type === 'list' && scheme.item) return `list[${getTypeString(scheme.item)}]`
  if (scheme.type === 'option' && scheme.item) return `option[${getTypeString(scheme.item)}]`
  if (scheme.type === 'map' && scheme.entry) return `map[${getTypeString(scheme.entry)}]`
  if (scheme.type === 'tuple' && scheme.items) {
    return `tuple[${scheme.items.map((item) => getTypeString(item)).join(', ')}]`
  }
  if (scheme.type === 'struct' && scheme.fields) {
    const fields = Object.entries(scheme.fields).map(
      ([key, field]) => `${pad}"${key}": ${getTypeString(field, indent + 1)}`,
    )
    return `struct[\n${fields.join(',\n')}\n${pad}]`
  }
  if (scheme.slots) {
    const parts = Object.entries(scheme.slots).map(
      ([key, s]) => `${key}: ${getTypeString(s)}`,
    )
    return `${scheme.type}{${parts.join(', ')}}`
  }

  if (children.length) {
    return `${scheme.type}[${children.map((c) => getTypeString(c.scheme)).join(', ')}]`
  }
  return scheme.type
}

export function findAllWildcardsInScheme(scheme: PinTypeScheme) {
  return findWildcards(scheme).map((w) => ({ kind: 'var' as const, groupIndex: w.groupIndex }))
}

export function replaceAllWildcards(
  sourceScheme: PinTypeScheme,
  replaces: { [groupIndex: number]: PinTypeScheme },
) {
  return applyBindings(sourceScheme, replaces)
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
