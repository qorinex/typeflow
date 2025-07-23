import type { Pin, PinMeta } from './pin'

export type NodeClass = 'const' | 'event' | 'func' | 'proc' | 'pivot' | 'other' | 'default'

export interface PlanNodeData {
  id: string
  displayName: string
  description?: string
  name?: string
  inPins: Pin[]
  inPinsMeta: PinMeta[]
  outPins: Pin[]
  outPinsMeta: PinMeta[]
  type: string
  nodeClass?: NodeClass
  x: number
  y: number
}

export interface SamplePlan {
  id: string
  name: string
  description?: string
  nodes: PlanNodeData[]
}
