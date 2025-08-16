import { defaultTheme } from './defaults'
import type { FlowTheme, FlowThemeOverride, PinTypeAppearance, NodeClassAppearance } from './types'

function mergePin(
  base: PinTypeAppearance,
  over?: Partial<PinTypeAppearance>,
): PinTypeAppearance {
  return { ...base, ...over }
}

function mergeNode(
  base: NodeClassAppearance,
  over?: Partial<NodeClassAppearance>,
): NodeClassAppearance {
  return { ...base, ...over }
}

export function createTheme(override: FlowThemeOverride = {}): FlowTheme {
  const pins: FlowTheme['pins'] = { ...defaultTheme.pins }
  if (override.pins) {
    for (const [key, val] of Object.entries(override.pins)) {
      pins[key] = mergePin(pins[key] || defaultTheme.pinFallback, val)
    }
  }

  const nodes: FlowTheme['nodes'] = { ...defaultTheme.nodes }
  if (override.nodes) {
    for (const [key, val] of Object.entries(override.nodes)) {
      if (!val) continue
      nodes[key] = mergeNode(nodes[key] || defaultTheme.nodes.default, val)
    }
  }

  return {
    pins,
    pinFallback: mergePin(defaultTheme.pinFallback, override.pinFallback),
    nodes,
    canvas: { ...defaultTheme.canvas, ...override.canvas },
  }
}

export function getPinColor(theme: FlowTheme, type: string): string {
  return theme.pins[type]?.color ?? theme.pinFallback.color
}

export function getPinLabel(theme: FlowTheme, type: string): string {
  return theme.pins[type]?.label ?? type
}

export function getNodeAppearance(theme: FlowTheme, nodeClass?: string) {
  const key = nodeClass || 'default'
  return theme.nodes[key] || theme.nodes.default
}
