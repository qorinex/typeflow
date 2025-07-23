import { cloneDeep } from './clone'
import { isWildcard, type PinTypeScheme } from '../types/pin'
import {
  getSchemeChildren,
  getTypeRegistry,
  setSchemeChildren,
  type TypeRegistry,
} from '../types/registry'
import { applyBindings, findWildcards, schemesEqual } from '../inference/unify'

export type TypeObject = PinTypeScheme

export function getTypeString(
  scheme: TypeObject,
  registry: TypeRegistry = getTypeRegistry(),
  indent = 0,
): string {
  if (isWildcard(scheme)) return `wildcard(${scheme.groupIndex})`

  const children = getSchemeChildren(scheme, registry)
  if (!children.length) return scheme.type

  const indentString = '  '.repeat(indent)

  if (scheme.type === 'list' && scheme.item) {
    return `list[${getTypeString(scheme.item, registry)}]`
  }
  if (scheme.type === 'option' && scheme.item) {
    return `option[${getTypeString(scheme.item, registry)}]`
  }
  if (scheme.type === 'map' && scheme.entry) {
    return `map[${getTypeString(scheme.entry, registry)}]`
  }
  if (scheme.type === 'tuple' && scheme.items) {
    return `tuple[${scheme.items.map((item) => getTypeString(item, registry)).join(', ')}]`
  }
  if (scheme.type === 'struct' && scheme.fields) {
    const fieldStrings = Object.entries(scheme.fields).map(
      ([key, field]) =>
        `${indentString}"${key}": ${getTypeString(field, registry, indent + 1)}`,
    )
    return `struct[\n${fieldStrings.join(',\n')}\n${indentString}]`
  }
  if (scheme.slots) {
    const parts = Object.entries(scheme.slots).map(
      ([key, slotScheme]) => `${key}: ${getTypeString(slotScheme, registry)}`,
    )
    return `${scheme.type}{${parts.join(', ')}}`
  }

  if (children.length) {
    return `${scheme.type}[${children
      .map((child) => getTypeString(child.scheme, registry))
      .join(', ')}]`
  }
  return scheme.type
}

export const getTypeStringWithWildcard = (
  sourceScheme: TypeObject,
  replacedScheme: TypeObject,
  registry: TypeRegistry = getTypeRegistry(),
): string => {
  return getTypeString(
    applyBindings(
      sourceScheme,
      Object.fromEntries(
        findWildcards(sourceScheme, registry).map((wildcardRef) => [
          wildcardRef.groupIndex,
          replacedScheme,
        ]),
      ),
      registry,
    ),
    registry,
  )
}

export const findWildcardScheme = (
  schemes: PinTypeScheme[],
  registry: TypeRegistry = getTypeRegistry(),
): (PinTypeScheme & { type: 'wildcard'; groupIndex: number }) | undefined => {
  for (const scheme of schemes) {
    if (isWildcard(scheme)) return scheme
    for (const child of getSchemeChildren(scheme, registry)) {
      const found: ReturnType<typeof findWildcardScheme> = findWildcardScheme(
        [child.scheme],
        registry,
      )
      if (found) return found
    }
  }
  return undefined
}

export const findAllWildcardsInScheme = (
  scheme: PinTypeScheme,
  registry: TypeRegistry = getTypeRegistry(),
) =>
  findWildcards(scheme, registry).map((wildcardRef) => ({
    type: 'wildcard' as const,
    groupIndex: wildcardRef.groupIndex,
  }))

export const replaceWildcardSchemeByGroupIndex = (
  scheme: PinTypeScheme,
  groupIndex: number,
  replaceSchema: PinTypeScheme,
  registry: TypeRegistry = getTypeRegistry(),
): PinTypeScheme => {
  if (isWildcard(scheme)) {
    return scheme.groupIndex === groupIndex ? replaceSchema : scheme
  }
  const children = getSchemeChildren(scheme, registry)
  if (!children.length) return scheme
  const next: Record<string, PinTypeScheme> = {}
  for (const child of children) {
    next[child.key] = replaceWildcardSchemeByGroupIndex(
      child.scheme,
      groupIndex,
      replaceSchema,
      registry,
    )
  }
  return setSchemeChildren(cloneDeep(scheme), next, registry)
}

export const replaceAllWildcards = (
  sourceScheme: PinTypeScheme,
  replaces: { [groupIndex: number]: PinTypeScheme },
  registry: TypeRegistry = getTypeRegistry(),
) => applyBindings(sourceScheme, replaces, registry)

export const extractAllWildcardSchemeByGroupIndex = (
  transferScheme: PinTypeScheme,
  toScheme: PinTypeScheme,
  registry: TypeRegistry = getTypeRegistry(),
): { [groupIndex: number]: PinTypeScheme } => {
  const extracted: { [groupIndex: number]: PinTypeScheme } = {}

  const walk = (transfer: PinTypeScheme, target: PinTypeScheme) => {
    if (isWildcard(target)) {
      extracted[target.groupIndex] = transfer
      return
    }
    if (isWildcard(transfer)) {
      extracted[transfer.groupIndex] = transfer
      return
    }
    if (transfer.type !== target.type && transfer.type !== 'any' && target.type !== 'any') {
      return
    }

    const transferChildren = getSchemeChildren(transfer, registry)
    const targetChildren = getSchemeChildren(target, registry)
    const transferByKey = Object.fromEntries(
      transferChildren.map((child) => [child.key, child.scheme]),
    )
    for (const child of targetChildren) {
      if (transferByKey[child.key]) walk(transferByKey[child.key], child.scheme)
    }
  }

  walk(transferScheme, toScheme)
  return extracted
}

export const validateSchemes = (
  source: PinTypeScheme,
  target: PinTypeScheme,
  registry: TypeRegistry = getTypeRegistry(),
): boolean => {
  if (isWildcard(source) || isWildcard(target)) return true
  if (source.type === 'any' || target.type === 'any') return true
  if (source.type !== target.type) return false

  const sourceChildren = getSchemeChildren(source, registry)
  const targetChildren = getSchemeChildren(target, registry)
  if (!sourceChildren.length && !targetChildren.length) return true

  const sourceByKey = Object.fromEntries(
    sourceChildren.map((child) => [child.key, child.scheme]),
  )
  for (const child of targetChildren) {
    if (!sourceByKey[child.key]) continue
    if (!validateSchemes(sourceByKey[child.key], child.scheme, registry)) return false
  }

  const targetByKey = Object.fromEntries(
    targetChildren.map((child) => [child.key, child.scheme]),
  )
  for (const child of sourceChildren) {
    if (!targetByKey[child.key]) continue
    if (!validateSchemes(child.scheme, targetByKey[child.key], registry)) return false
  }
  return true
}

export function resolveScheme(
  scheme: PinTypeScheme,
  nodeId: string,
  nodeWildcards: { [nodeId: string]: { [groupIndex: number]: PinTypeScheme } },
  registry: TypeRegistry = getTypeRegistry(),
): PinTypeScheme {
  try {
    return applyBindings(scheme, nodeWildcards[nodeId], registry)
  } catch {
    return scheme
  }
}

export { schemesEqual }
