import type { PlanNodeData } from '../types/node'
import { dataToPinId } from './pin'

export function buildFlowElements(planNodes: PlanNodeData[]) {
  const nodes = planNodes.map((n) => ({
    id: n.id,
    type: 'plan',
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

  for (const node of planNodes) {
    node.inPinsMeta.forEach((meta, inIdx) => {
      for (const link of meta.links || []) {
        if (
          link.inNode == null ||
          link.outNode == null ||
          link.inIdx == null ||
          link.outIdx == null
        ) {
          continue
        }

        const sourceNode = planNodes.find((n) => n.id === link.inNode)
        const targetNode = planNodes.find((n) => n.id === link.outNode)
        if (!sourceNode || !targetNode) continue

        const inPin = sourceNode.inPins[link.inIdx]
        const outPin = targetNode.outPins[link.outIdx]
        if (!inPin || !outPin) continue

        const sourceHandle = dataToPinId(
          'in',
          link.inIdx,
          String(link.inNode),
          inPin.valueSchema.type,
        )
        const targetHandle = dataToPinId(
          'out',
          link.outIdx,
          String(link.outNode),
          outPin.valueSchema.type,
        )

        edges.push({
          id: `${link.outNode}_${link.outIdx}__${link.inNode}_${link.inIdx}`,
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
