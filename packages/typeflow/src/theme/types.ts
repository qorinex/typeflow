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

export interface FlowTheme {
  pins: Record<string, PinTypeAppearance>
  pinFallback: PinTypeAppearance
  nodes: Record<string, NodeClassAppearance>
  canvas: CanvasAppearance
}

export type FlowThemeOverride = {
  pins?: Record<string, Partial<PinTypeAppearance> | PinTypeAppearance>
  pinFallback?: Partial<PinTypeAppearance>
  nodes?: Record<string, Partial<NodeClassAppearance>>
  canvas?: Partial<CanvasAppearance>
}
