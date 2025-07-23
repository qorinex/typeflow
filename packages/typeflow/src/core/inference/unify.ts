import { cloneDeep } from '../helpers/clone'
import { isWildcard, type PinTypeScheme } from '../types/pin'
import {
  getSchemeChildren,
  getTypeRegistry,
  setSchemeChildren,
  type TypeRegistry,
} from '../types/registry'

export type UnifyOk = { ok: true; scheme: PinTypeScheme }
export type UnifyErr = { ok: false; reason: string }
export type UnifyResult = UnifyOk | UnifyErr

export type BindSide = 'left' | 'right'

export type BindContext = {
  resolveVar: (side: BindSide, groupIndex: number) => PinTypeScheme | undefined
  bindVar: (side: BindSide, groupIndex: number, scheme: PinTypeScheme) => boolean
}

export function schemesEqual(
  left: PinTypeScheme,
  right: PinTypeScheme,
  registry: TypeRegistry = getTypeRegistry(),
): boolean {
  if (isWildcard(left) && isWildcard(right)) return left.groupIndex === right.groupIndex
  if (isWildcard(left) || isWildcard(right)) return false
  if (left.type !== right.type) {
    if (left.type === 'any' || right.type === 'any') return true
    return false
  }
  const leftChildren = getSchemeChildren(left, registry)
  const rightChildren = getSchemeChildren(right, registry)
  if (leftChildren.length !== rightChildren.length) return false
  const rightByKey = Object.fromEntries(rightChildren.map((child) => [child.key, child.scheme]))
  for (const child of leftChildren) {
    const other = rightByKey[child.key]
    if (!other || !schemesEqual(child.scheme, other, registry)) return false
  }
  return true
}

export function unify(
  left: PinTypeScheme,
  right: PinTypeScheme,
  ctx?: BindContext,
  registry: TypeRegistry = getTypeRegistry(),
): UnifyResult {
  if (ctx && isWildcard(left)) {
    const bound = ctx.resolveVar('left', left.groupIndex)
    if (bound) return unify(bound, right, ctx, registry)
  }
  if (ctx && isWildcard(right)) {
    const bound = ctx.resolveVar('right', right.groupIndex)
    if (bound) return unify(left, bound, ctx, registry)
  }

  if (ctx && isWildcard(left) && isWildcard(right)) {
    return { ok: true, scheme: left }
  }
  if (ctx && isWildcard(left)) {
    ctx.bindVar('left', left.groupIndex, cloneDeep(right))
    return { ok: true, scheme: cloneDeep(right) }
  }
  if (ctx && isWildcard(right)) {
    ctx.bindVar('right', right.groupIndex, cloneDeep(left))
    return { ok: true, scheme: cloneDeep(left) }
  }

  if (isWildcard(left) || isWildcard(right)) {
    return { ok: true, scheme: isWildcard(left) ? right : left }
  }

  if (left.type === 'any') return { ok: true, scheme: cloneDeep(right) }
  if (right.type === 'any') return { ok: true, scheme: cloneDeep(left) }

  if (left.type !== right.type) {
    return { ok: false, reason: `type mismatch: ${left.type} vs ${right.type}` }
  }

  const leftChildren = getSchemeChildren(left, registry)
  const rightChildren = getSchemeChildren(right, registry)

  if (leftChildren.length === 0 && rightChildren.length === 0) {
    return { ok: true, scheme: cloneDeep(left) }
  }

  const rightByKey = Object.fromEntries(rightChildren.map((child) => [child.key, child.scheme]))
  const leftByKey = Object.fromEntries(leftChildren.map((child) => [child.key, child.scheme]))
  const keys = new Set([...Object.keys(leftByKey), ...Object.keys(rightByKey)])
  const unifiedChildren: Record<string, PinTypeScheme> = {}

  for (const key of keys) {
    const leftChild = leftByKey[key]
    const rightChild = rightByKey[key]
    if (!leftChild && rightChild) {
      unifiedChildren[key] = cloneDeep(rightChild)
      continue
    }
    if (leftChild && !rightChild) {
      unifiedChildren[key] = cloneDeep(leftChild)
      continue
    }
    const childResult = unify(leftChild!, rightChild!, ctx, registry)
    if (!childResult.ok) return childResult
    unifiedChildren[key] = childResult.scheme
  }

  return {
    ok: true,
    scheme: setSchemeChildren(cloneDeep(left), unifiedChildren, registry),
  }
}

export function applyBindings(
  scheme: PinTypeScheme,
  bindings: { [groupIndex: number]: PinTypeScheme } | undefined,
  registry: TypeRegistry = getTypeRegistry(),
): PinTypeScheme {
  if (!bindings) return scheme
  return replaceVars(scheme, (groupIndex) => bindings[groupIndex], registry)
}

function replaceVars(
  scheme: PinTypeScheme,
  lookup: (groupIndex: number) => PinTypeScheme | undefined,
  registry: TypeRegistry,
): PinTypeScheme {
  if (isWildcard(scheme)) {
    const bound = lookup(scheme.groupIndex)
    return bound ? cloneDeep(bound) : scheme
  }
  const children = getSchemeChildren(scheme, registry)
  if (!children.length) return scheme
  const next: Record<string, PinTypeScheme> = {}
  let changed = false
  for (const child of children) {
    const replaced = replaceVars(child.scheme, lookup, registry)
    next[child.key] = replaced
    if (replaced !== child.scheme) changed = true
  }
  return changed ? setSchemeChildren(cloneDeep(scheme), next, registry) : scheme
}

export function findWildcards(
  scheme: PinTypeScheme,
  registry: TypeRegistry = getTypeRegistry(),
): { groupIndex: number }[] {
  if (isWildcard(scheme)) return [{ groupIndex: scheme.groupIndex }]
  const found: { groupIndex: number }[] = []
  for (const child of getSchemeChildren(scheme, registry)) {
    found.push(...findWildcards(child.scheme, registry))
  }
  return found
}
