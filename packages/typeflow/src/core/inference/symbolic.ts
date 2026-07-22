import { cloneDeep } from '../helpers/clone'
import { getSchemeChildren, setSchemeChildren } from '../helpers/schemeTree'
import { findTypeVars } from './unify'
import { isTypeVar, type PinTypeScheme } from '../types/pin'
import type { NodeData } from '../types/node'
import type { NodeWC } from './propagate'

type ScopedVar = {
  kind: 'var'
  nodeId: string
  groupIndex: number
}

type ScopedNamed = {
  type: string
  args?: Record<string, ScopedScheme>
}

type ScopedScheme = ScopedVar | ScopedNamed

export type SymbolicConstraint = {
  left: { nodeId: string; scheme: PinTypeScheme }
  right: { nodeId: string; scheme: PinTypeScheme }
}

const isScopedVar = (scheme: ScopedScheme): scheme is ScopedVar => 'kind' in scheme && scheme.kind === 'var'
const varKey = (variable: ScopedVar) => `${variable.nodeId}\u0000${variable.groupIndex}`

function scopeScheme(scheme: PinTypeScheme, nodeId: string): ScopedScheme {
  if (isTypeVar(scheme)) return { kind: 'var', nodeId, groupIndex: scheme.groupIndex }
  const children = getSchemeChildren(scheme)
  if (!children.length) return { type: scheme.type }
  return {
    type: scheme.type,
    args: Object.fromEntries(
      children.map((child) => [child.key, scopeScheme(child.scheme, nodeId)]),
    ),
  }
}

function resolveScoped(
  scheme: ScopedScheme,
  bindings: Map<string, ScopedScheme>,
  seen = new Set<string>(),
): ScopedScheme {
  if (isScopedVar(scheme)) {
    const key = varKey(scheme)
    const bound = bindings.get(key)
    if (!bound || seen.has(key)) return scheme
    const nextSeen = new Set(seen)
    nextSeen.add(key)
    return resolveScoped(bound, bindings, nextSeen)
  }

  if (!scheme.args) return scheme
  return {
    type: scheme.type,
    args: Object.fromEntries(
      Object.entries(scheme.args).map(([key, child]) => [
        key,
        resolveScoped(child, bindings, new Set(seen)),
      ]),
    ),
  }
}

function containsVar(
  scheme: ScopedScheme,
  searchedKey: string,
  bindings: Map<string, ScopedScheme>,
  seen = new Set<string>(),
): boolean {
  const resolved = resolveScoped(scheme, bindings, seen)
  if (isScopedVar(resolved)) return varKey(resolved) === searchedKey
  return Object.values(resolved.args ?? {}).some((child) =>
    containsVar(child, searchedKey, bindings, new Set(seen)),
  )
}

function unifyScoped(
  leftInput: ScopedScheme,
  rightInput: ScopedScheme,
  bindings: Map<string, ScopedScheme>,
): void {
  const left = resolveScoped(leftInput, bindings)
  const right = resolveScoped(rightInput, bindings)

  if (isScopedVar(left)) {
    const leftKey = varKey(left)
    if (isScopedVar(right) && leftKey === varKey(right)) return
    if (!containsVar(right, leftKey, bindings)) bindings.set(leftKey, cloneDeep(right))
    return
  }
  if (isScopedVar(right)) {
    const rightKey = varKey(right)
    if (!containsVar(left, rightKey, bindings)) bindings.set(rightKey, cloneDeep(left))
    return
  }

  if (left.type === 'any' || right.type === 'any' || left.type !== right.type) return
  const rightArgs = right.args ?? {}
  for (const [key, leftChild] of Object.entries(left.args ?? {})) {
    const rightChild = rightArgs[key]
    if (rightChild) unifyScoped(leftChild, rightChild, bindings)
  }
}

function unscopeScheme(scheme: ScopedScheme): PinTypeScheme {
  if (isScopedVar(scheme)) return { kind: 'var', groupIndex: scheme.groupIndex }
  if (!scheme.args || !Object.keys(scheme.args).length) return { type: scheme.type }
  return setSchemeChildren(
    { type: scheme.type },
    Object.fromEntries(
      Object.entries(scheme.args).map(([key, child]) => [key, unscopeScheme(child)]),
    ),
  )
}

export function inferSymbolicBindings(
  constraints: SymbolicConstraint[],
  graphNodes: NodeData[],
): NodeWC {
  const bindings = new Map<string, ScopedScheme>()

  for (const constraint of constraints) {
    unifyScoped(
      scopeScheme(constraint.left.scheme, constraint.left.nodeId),
      scopeScheme(constraint.right.scheme, constraint.right.nodeId),
      bindings,
    )
  }

  const displayBindings: NodeWC = {}
  for (const node of graphNodes) {
    const groups = new Set<number>()
    for (const pin of [...node.inPins, ...node.outPins]) {
      for (const variable of findTypeVars(pin.valueSchema)) groups.add(variable.groupIndex)
    }

    for (const groupIndex of groups) {
      const original: ScopedVar = { kind: 'var', nodeId: node.id, groupIndex }
      const resolved = resolveScoped(original, bindings)
      if (isScopedVar(resolved) && varKey(resolved) === varKey(original)) continue
      displayBindings[node.id] ||= {}
      displayBindings[node.id][groupIndex] = unscopeScheme(resolved)
    }
  }

  return displayBindings
}
