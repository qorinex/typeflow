import type { PlanNodeData } from '../types/node'
import type { PinTypeScheme } from '../types/pin'
import { getTypeRegistry, type TypeRegistry } from '../types/registry'
import { applyBindings, schemesEqual, unify, type BindContext } from './unify'
import { pinIdToData } from '../helpers/pin'
import { cloneDeep } from '../helpers/clone'

export type NodeWC = {
  [nodeId: string]: {
    [groupIndex: number]: PinTypeScheme
  }
}

export type FlowEdgeLike = {
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}

export type InferenceConflict = {
  edgeId?: string
  source: string
  target: string
  reason: string
}

export type InferenceResult = {
  bindings: NodeWC
  conflicts: InferenceConflict[]
}

type PinEndpoint = {
  nodeId: string
  scheme: PinTypeScheme
}

type EdgeConstraint = {
  id: string
  left: PinEndpoint
  right: PinEndpoint
}

function resolvePinEndpoint(
  node: PlanNodeData,
  handle: string,
): PinEndpoint | null {
  const { direction, index, nodeId } = pinIdToData(handle)
  const pins = direction === 'in' ? node.inPins : node.outPins
  const pin = pins[index]
  if (!pin) return null
  return { scheme: pin.valueSchema, nodeId: node.id || nodeId }
}

export function inferWildcards(
  edges: FlowEdgeLike[],
  planNodes: PlanNodeData[],
  registry: TypeRegistry = getTypeRegistry(),
): InferenceResult {
  const nodesById = Object.fromEntries(planNodes.map((node) => [node.id, node]))
  const bindings: NodeWC = {}
  const conflicts: InferenceConflict[] = []
  const constraints: EdgeConstraint[] = []

  for (const edge of edges) {
    if (!edge.sourceHandle || !edge.targetHandle) continue
    const sourceNode = nodesById[edge.source]
    const targetNode = nodesById[edge.target]
    if (!sourceNode || !targetNode) continue

    const left = resolvePinEndpoint(sourceNode, edge.sourceHandle)
    const right = resolvePinEndpoint(targetNode, edge.targetHandle)
    if (!left || !right) continue

    constraints.push({
      id: `${edge.source}:${edge.sourceHandle}=>${edge.target}:${edge.targetHandle}`,
      left,
      right,
    })
  }

  const queue = constraints.map((_, index) => index)
  const inQueue = new Set(queue)
  let guard = 0
  const maxIter = Math.max(64, constraints.length * 32)

  const touchNode = (nodeId: string) => {
    constraints.forEach((constraint, index) => {
      const touches =
        constraint.left.nodeId === nodeId || constraint.right.nodeId === nodeId
      if (touches && !inQueue.has(index)) {
        queue.push(index)
        inQueue.add(index)
      }
    })
  }

  while (queue.length && guard++ < maxIter) {
    const constraintIndex = queue.shift()!
    inQueue.delete(constraintIndex)
    const constraint = constraints[constraintIndex]

    const ctx: BindContext = {
      resolveVar: (side, groupIndex) => {
        const nodeId = side === 'left' ? constraint.left.nodeId : constraint.right.nodeId
        return bindings[nodeId]?.[groupIndex]
          ? cloneDeep(bindings[nodeId][groupIndex])
          : undefined
      },
      bindVar: (side, groupIndex, scheme) => {
        const nodeId = side === 'left' ? constraint.left.nodeId : constraint.right.nodeId
        bindings[nodeId] = bindings[nodeId] || {}
        const previous = bindings[nodeId][groupIndex]
        if (previous && schemesEqual(previous, scheme, registry)) return false
        if (previous && scheme.type === 'wildcard' && previous.type !== 'wildcard') return false
        if (
          previous &&
          previous.type !== 'wildcard' &&
          scheme.type !== 'wildcard' &&
          !schemesEqual(previous, scheme, registry)
        ) {
          const merged = unify(previous, scheme, undefined, registry)
          if (!merged.ok) {
            conflicts.push({
              edgeId: constraint.id,
              source: constraint.left.nodeId,
              target: constraint.right.nodeId,
              reason: merged.reason,
            })
            return false
          }
          if (schemesEqual(previous, merged.scheme, registry)) return false
          bindings[nodeId][groupIndex] = cloneDeep(merged.scheme)
          touchNode(nodeId)
          return true
        }
        bindings[nodeId][groupIndex] = cloneDeep(scheme)
        touchNode(nodeId)
        return true
      },
    }

    const leftResolved = applyBindings(
      constraint.left.scheme,
      bindings[constraint.left.nodeId],
      registry,
    )
    const rightResolved = applyBindings(
      constraint.right.scheme,
      bindings[constraint.right.nodeId],
      registry,
    )

    const result = unify(leftResolved, rightResolved, ctx, registry)
    if (!result.ok) {
      conflicts.push({
        edgeId: constraint.id,
        source: constraint.left.nodeId,
        target: constraint.right.nodeId,
        reason: result.reason,
      })
    }
  }

  return { bindings, conflicts }
}
