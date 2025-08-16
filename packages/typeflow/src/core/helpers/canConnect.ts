import type { NodeData } from '../types/node'
import type { NodeWC } from '../inference/propagate'
import { pinIdToData } from './pin'
import { resolveScheme, validateSchemes } from './pinTypes'

export type ConnectParams = {
  source: string
  target: string
  sourceHandle: string
  targetHandle: string
}

export function canConnect(
  params: ConnectParams,
  nodesById: Record<string, NodeData>,
  nodeWildcards: NodeWC,
): boolean {
  if (!params.sourceHandle || !params.targetHandle || !params.source || !params.target) {
    return false
  }

  const sourceRef = pinIdToData(params.sourceHandle)
  const targetRef = pinIdToData(params.targetHandle)
  if (params.source === params.target || sourceRef.direction === targetRef.direction) {
    return false
  }

  const sourceNode = nodesById[params.source]
  const targetNode = nodesById[params.target]
  if (!sourceNode || !targetNode) return false

  const sourcePins = sourceRef.direction === 'in' ? sourceNode.inPins : sourceNode.outPins
  const targetPins = targetRef.direction === 'in' ? targetNode.inPins : targetNode.outPins
  const sourcePin = sourcePins[sourceRef.index]
  const targetPin = targetPins[targetRef.index]
  if (!sourcePin || !targetPin) return false

  if (sourcePin.linkable === false || targetPin.linkable === false) return false

  const sourceScheme = resolveScheme(sourcePin.valueSchema, sourceNode.id, nodeWildcards)
  const targetScheme = resolveScheme(targetPin.valueSchema, targetNode.id, nodeWildcards)
  return validateSchemes(sourceScheme, targetScheme)
}
