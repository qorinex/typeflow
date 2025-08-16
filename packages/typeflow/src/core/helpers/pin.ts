import type { Direction } from '../types/pin'

// dir:idx:node:type - node/type are encodeURIComponent
export function dataToPinId(
  direction: Direction,
  index: number,
  nodeId: string,
  type: string,
): string {
  return `${direction}:${index}:${encodeURIComponent(nodeId)}:${encodeURIComponent(type)}`
}

export function pinIdToData(id: string) {
  const [direction, index, nodeId, type] = id.split(':')
  return {
    direction: (direction || 'in') as Direction,
    index: Number(index) || 0,
    nodeId: decodeURIComponent(nodeId || ''),
    type: decodeURIComponent(type || 'any'),
  }
}
