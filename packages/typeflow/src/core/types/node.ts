import type { Pin } from './pin'

export interface NodeData {
  id: string
  displayName: string
  description?: string
  name?: string
  inPins: Pin[]
  outPins: Pin[]
  type: string
  // free string for theming (blueprint: const | event | func etc)
  nodeClass?: string
  x: number
  y: number
}
