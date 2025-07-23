import type { Direction } from '../types/pin'

export function pinIdToData(id: string) {
  const parts = id.split('_')
  if (parts.length < 4) {
    return {
      direction: (parts[0] || 'in') as Direction,
      index: Number(parts[1] || 0),
      nodeId: parts[2] || '',
      type: parts[3] || 'any',
    }
  }
  const direction = parts[0] as Direction
  const index = Number(parts[1])
  const type = parts[parts.length - 1]
  const nodeId = parts.slice(2, -1).join('_')
  return { direction, index, nodeId, type }
}

export function dataToPinId(direction: Direction, index: number, nodeId: string, type: string) {
  return `${direction}_${index}_${nodeId}_${type}`
}
