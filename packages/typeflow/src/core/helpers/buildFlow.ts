import type { NodeData } from '../types/node'
import { schemeTypeTag } from '../types/pin'
import { dataToPinId } from './pin'
import { linkToEdgeId, type LinkRef } from './link'

export function buildFlowElements(graphNodes: NodeData[]) {
  const nodes = graphNodes.map((n) => ({
    id: n.id,
    type: 'flow',
    label: n.displayName,
    position: { x: n.x, y: n.y },
    data: { ...n },
  }))

  const edges: {
    id: string
    source: string
    sourceHandle: string
    target: string
    targetHandle: string
    type: string
  }[] = []

  for (const node of graphNodes) {
    node.inPins.forEach((inPin, inIdx) => {
      for (const link of inPin.links || []) {
        const sourceNode = graphNodes.find((n) => n.id === link.inNode)
        const targetNode = graphNodes.find((n) => n.id === link.outNode)
        if (!sourceNode || !targetNode) continue

        const sourceInPin = sourceNode.inPins[link.inIdx]
        const outPin = targetNode.outPins[link.outIdx]
        if (!sourceInPin || !outPin) continue

        const sourceHandle = dataToPinId(
          'in',
          link.inIdx,
          String(link.inNode),
          schemeTypeTag(sourceInPin.valueSchema),
        )
        const targetHandle = dataToPinId(
          'out',
          link.outIdx,
          String(link.outNode),
          schemeTypeTag(outPin.valueSchema),
        )

        const ref: LinkRef = {
          inNode: String(link.inNode),
          inIdx: link.inIdx,
          outNode: String(link.outNode),
          outIdx: link.outIdx,
        }

        edges.push({
          id: linkToEdgeId(ref),
          source: String(link.inNode),
          sourceHandle,
          target: String(link.outNode),
          targetHandle,
          type: 'typed',
        })
      }
    })
  }

  return [...nodes, ...edges]
}
