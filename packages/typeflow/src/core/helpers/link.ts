import type { PinLink } from '../types/pin'
import type { NodeData } from '../types/node'
import type { NodeWC } from '../inference/propagate'
import { cloneDeep } from './clone'
import { canConnect, type ConnectParams } from './canConnect'
import { pinIdToData } from './pin'

export type LinkRef = {
  inNode: string
  inIdx: number
  outNode: string
  outIdx: number
}

export type AddLinkResult = {
  nodes: NodeData[]
  link: LinkRef
  edgeId: string
}

export type RemoveLinkResult = {
  nodes: NodeData[]
  link: LinkRef
  edgeId: string
}

// out/i=>in/j, nodes encoded
export function linkToEdgeId(link: LinkRef): string {
  return `${encodeURIComponent(link.outNode)}/${link.outIdx}=>${encodeURIComponent(link.inNode)}/${link.inIdx}`
}

export function edgeIdToLink(edgeId: string): LinkRef | null {
  const [outSide, inSide] = edgeId.split('=>')
  if (!outSide || !inSide) return null

  const parse = (s: string) => {
    const i = s.lastIndexOf('/')
    if (i <= 0) return null
    const idx = Number(s.slice(i + 1))
    if (!Number.isFinite(idx)) return null
    return { nodeId: decodeURIComponent(s.slice(0, i)), idx }
  }

  const out = parse(outSide)
  const inn = parse(inSide)
  if (!out || !inn) return null

  return {
    outNode: out.nodeId,
    outIdx: out.idx,
    inNode: inn.nodeId,
    inIdx: inn.idx,
  }
}

export function connectionToLinkRef(params: ConnectParams): LinkRef | null {
  if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) {
    return null
  }

  const src = pinIdToData(params.sourceHandle)
  const tgt = pinIdToData(params.targetHandle)

  if (src.direction === 'in' && tgt.direction === 'out') {
    return {
      inNode: params.source,
      inIdx: src.index,
      outNode: params.target,
      outIdx: tgt.index,
    }
  }

  if (src.direction === 'out' && tgt.direction === 'in') {
    return {
      inNode: params.target,
      inIdx: tgt.index,
      outNode: params.source,
      outIdx: src.index,
    }
  }

  return null
}

export function linksEqual(a: PinLink | LinkRef, b: PinLink | LinkRef): boolean {
  return (
    a.inNode === b.inNode &&
    a.inIdx === b.inIdx &&
    a.outNode === b.outNode &&
    a.outIdx === b.outIdx
  )
}

function findLinkIndex(links: PinLink[], ref: LinkRef): number {
  return links.findIndex((l) => linksEqual(l, ref))
}

export function addLink(
  graphNodes: NodeData[],
  params: ConnectParams,
  nodeWildcards: NodeWC = {},
): AddLinkResult | null {
  const link = connectionToLinkRef(params)
  if (!link) return null

  const nodesById = Object.fromEntries(graphNodes.map((n) => [n.id, n]))
  if (!canConnect(params, nodesById, nodeWildcards)) return null

  const inNode = nodesById[link.inNode]
  if (!inNode) return null

  const inPin = inNode.inPins[link.inIdx]
  if (!inPin) return null
  if (findLinkIndex(inPin.links || [], link) >= 0) return null

  const nodes = cloneDeep(graphNodes)
  const target = nodes.find((n) => n.id === link.inNode)!
  const targetPin = target.inPins[link.inIdx]
  if (!targetPin.links) targetPin.links = []
  targetPin.links.push({
    inNode: link.inNode,
    inIdx: link.inIdx,
    outNode: link.outNode,
    outIdx: link.outIdx,
  })

  return { nodes, link, edgeId: linkToEdgeId(link) }
}

export function removeLink(
  graphNodes: NodeData[],
  linkOrEdgeId: LinkRef | string,
): RemoveLinkResult | null {
  const link = typeof linkOrEdgeId === 'string' ? edgeIdToLink(linkOrEdgeId) : linkOrEdgeId
  if (!link) return null

  const nodes = cloneDeep(graphNodes)
  const node = nodes.find((n) => n.id === link.inNode)
  if (!node) return null

  const pin = node.inPins[link.inIdx]
  if (!pin?.links?.length) return null

  const idx = findLinkIndex(pin.links, link)
  if (idx < 0) return null

  pin.links.splice(idx, 1)
  return { nodes, link, edgeId: linkToEdgeId(link) }
}
