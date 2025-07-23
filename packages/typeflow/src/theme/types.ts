import type { NodeClass } from '../core'

export interface PinTypeAppearance {
  color: string
  label?: string
}

export interface NodeClassAppearance {
  borderColor: string
  headerBackground: string
  icon?: string
}

export interface CanvasAppearance {
  background: string
  patternColor: string
  patternGap: number
  edgeStrokeWidth: number
  edgeSelectedFilter?: string
}

export interface ChromeAppearance {
  showLegend: boolean
  showWildcardPanel: boolean
}

export interface PlanTheme {
  pins: Record<string, PinTypeAppearance>
  pinFallback: PinTypeAppearance
  nodes: Record<NodeClass | 'default', NodeClassAppearance>
  canvas: CanvasAppearance
  chrome: ChromeAppearance
}

export type PlanThemeOverride = {
  pins?: Record<string, Partial<PinTypeAppearance> | PinTypeAppearance>
  pinFallback?: Partial<PinTypeAppearance>
  nodes?: Partial<Record<NodeClass | 'default', Partial<NodeClassAppearance>>>
  canvas?: Partial<CanvasAppearance>
  chrome?: Partial<ChromeAppearance>
}
