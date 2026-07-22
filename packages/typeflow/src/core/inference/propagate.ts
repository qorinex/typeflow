import type { NodeData } from '../types/node'
import { isTypeVar, type PinTypeScheme } from '../types/pin'
import { applyBindings, schemesEqual, unify, type BindContext } from './unify'
import { pinIdToData } from '../helpers/pin'
import { cloneDeep } from '../helpers/clone'
import { connectionToLinkRef, linkToEdgeId } from '../helpers/link'
import { inferSymbolicBindings } from './symbolic'

export type NodeWC = {
  [nodeId: string]: {
    [groupIndex: number]: PinTypeScheme
  }
}

export type FlowEdgeLike = {
  id?: string
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
  displayBindings: NodeWC
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

function resolvePinEndpoint(node: NodeData, handle: string): PinEndpoint | null {
  const { direction, index, nodeId } = pinIdToData(handle)
  const pin = (direction === 'in' ? node.inPins : node.outPins)[index]
  if (!pin) return null
  return { scheme: pin.valueSchema, nodeId: node.id || nodeId }
}

function edgeKey(edge: FlowEdgeLike): string {
  if (edge.id) return edge.id
  if (edge.sourceHandle && edge.targetHandle) {
    const link = connectionToLinkRef({
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })
    if (link) return linkToEdgeId(link)
  }
  return `${edge.source}->${edge.target}`
}

export function inferWildcards(
  edges: FlowEdgeLike[],
  graphNodes: NodeData[],
): InferenceResult {
  const nodesById = Object.fromEntries(graphNodes.map((n) => [n.id, n]))
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

    constraints.push({ id: edgeKey(edge), left, right })
  }

  const queue = constraints.map((_, i) => i)
  const inQueue = new Set(queue)
  let guard = 0
  const maxIter = Math.max(64, constraints.length * 32)

  const touchNode = (nodeId: string) => {
    for (let i = 0; i < constraints.length; i++) {
      const c = constraints[i]
      if ((c.left.nodeId === nodeId || c.right.nodeId === nodeId) && !inQueue.has(i)) {
        queue.push(i)
        inQueue.add(i)
      }
    }
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
        const prev = bindings[nodeId][groupIndex]
        if (prev && schemesEqual(prev, scheme)) return false
        if (prev && isTypeVar(scheme) && !isTypeVar(prev)) return false
        if (prev && !isTypeVar(prev) && !isTypeVar(scheme) && !schemesEqual(prev, scheme)) {
          const merged = unify(prev, scheme)
          if (!merged.ok) {
            conflicts.push({
              edgeId: constraint.id,
              source: constraint.left.nodeId,
              target: constraint.right.nodeId,
              reason: merged.reason,
            })
            return false
          }
          if (schemesEqual(prev, merged.scheme)) return false
          bindings[nodeId][groupIndex] = cloneDeep(merged.scheme)
          touchNode(nodeId)
          return true
        }
        bindings[nodeId][groupIndex] = cloneDeep(scheme)
        touchNode(nodeId)
        return true
      },
    }

    const left = applyBindings(constraint.left.scheme, bindings[constraint.left.nodeId])
    const right = applyBindings(constraint.right.scheme, bindings[constraint.right.nodeId])
    const result = unify(left, right, ctx)
    if (!result.ok) {
      conflicts.push({
        edgeId: constraint.id,
        source: constraint.left.nodeId,
        target: constraint.right.nodeId,
        reason: result.reason,
      })
    }
  }

  if (queue.length) {
    conflicts.push({
      source: '',
      target: '',
      reason: `max iterations (${maxIter}), ${queue.length} left`,
    })
  }

  const displayBindings = inferSymbolicBindings(constraints, graphNodes)

  return { bindings, displayBindings, conflicts }
}
