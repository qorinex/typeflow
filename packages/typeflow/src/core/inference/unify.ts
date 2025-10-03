import { cloneDeep } from '../helpers/clone'
import { isTypeVar, type PinTypeScheme } from '../types/pin'
import { getSchemeChildren, setSchemeChildren } from '../helpers/schemeTree'

export type UnifyOk = { ok: true; scheme: PinTypeScheme }
export type UnifyErr = { ok: false; reason: string }
export type UnifyResult = UnifyOk | UnifyErr

export type BindSide = 'left' | 'right'

export type BindContext = {
  resolveVar: (side: BindSide, groupIndex: number) => PinTypeScheme | undefined
  bindVar: (side: BindSide, groupIndex: number, scheme: PinTypeScheme) => boolean
}

export function schemesEqual(left: PinTypeScheme, right: PinTypeScheme): boolean {
  if (isTypeVar(left) && isTypeVar(right)) return left.groupIndex === right.groupIndex
  if (isTypeVar(left) || isTypeVar(right)) return false
  if (left.type !== right.type) {
    if (left.type === 'any' || right.type === 'any') return true
    return false
  }
  const leftChildren = getSchemeChildren(left)
  const rightChildren = getSchemeChildren(right)
  if (leftChildren.length !== rightChildren.length) return false
  const rightByKey = Object.fromEntries(rightChildren.map((child) => [child.key, child.scheme]))
  for (const child of leftChildren) {
    const other = rightByKey[child.key]
    if (!other || !schemesEqual(child.scheme, other)) return false
  }
  return true
}

export function unify(
  left: PinTypeScheme,
  right: PinTypeScheme,
  ctx?: BindContext,
): UnifyResult {
  if (ctx && isTypeVar(left)) {
    const bound = ctx.resolveVar('left', left.groupIndex)
    if (bound) return unify(bound, right, ctx)
  }
  if (ctx && isTypeVar(right)) {
    const bound = ctx.resolveVar('right', right.groupIndex)
    if (bound) return unify(left, bound, ctx)
  }

  if (ctx && isTypeVar(left) && isTypeVar(right)) {
    return { ok: true, scheme: left }
  }
  if (ctx && isTypeVar(left)) {
    ctx.bindVar('left', left.groupIndex, cloneDeep(right))
    return { ok: true, scheme: cloneDeep(right) }
  }
  if (ctx && isTypeVar(right)) {
    ctx.bindVar('right', right.groupIndex, cloneDeep(left))
    return { ok: true, scheme: cloneDeep(left) }
  }

  if (isTypeVar(left) || isTypeVar(right)) {
    return { ok: true, scheme: isTypeVar(left) ? right : left }
  }

  if (left.type === 'any') return { ok: true, scheme: cloneDeep(right) }
  if (right.type === 'any') return { ok: true, scheme: cloneDeep(left) }

  if (left.type !== right.type) {
    return { ok: false, reason: `type mismatch: ${left.type} vs ${right.type}` }
  }

  const leftChildren = getSchemeChildren(left)
  const rightChildren = getSchemeChildren(right)

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
    const childResult = unify(leftChild!, rightChild!, ctx)
    if (!childResult.ok) return childResult
    unifiedChildren[key] = childResult.scheme
  }

  return {
    ok: true,
    scheme: setSchemeChildren(cloneDeep(left), unifiedChildren),
  }
}

export function applyBindings(
  scheme: PinTypeScheme,
  bindings: { [groupIndex: number]: PinTypeScheme } | undefined,
): PinTypeScheme {
  if (!bindings) return scheme
  return replaceVars(scheme, (groupIndex) => bindings[groupIndex])
}

function replaceVars(
  scheme: PinTypeScheme,
  lookup: (groupIndex: number) => PinTypeScheme | undefined,
): PinTypeScheme {
  if (isTypeVar(scheme)) {
    const bound = lookup(scheme.groupIndex)
    return bound ? cloneDeep(bound) : scheme
  }
  const children = getSchemeChildren(scheme)
  if (!children.length) return scheme
  const next: Record<string, PinTypeScheme> = {}
  let changed = false
  for (const child of children) {
    const replaced = replaceVars(child.scheme, lookup)
    next[child.key] = replaced
    if (replaced !== child.scheme) changed = true
  }
  return changed ? setSchemeChildren(cloneDeep(scheme), next) : scheme
}

export function findTypeVars(scheme: PinTypeScheme): { groupIndex: number }[] {
  if (isTypeVar(scheme)) return [{ groupIndex: scheme.groupIndex }]
  const found: { groupIndex: number }[] = []
  for (const child of getSchemeChildren(scheme)) {
    found.push(...findTypeVars(child.scheme))
  }
  return found
}
