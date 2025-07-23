import { defaultTheme } from './defaults'
import type { PlanTheme, PlanThemeOverride, PinTypeAppearance, NodeClassAppearance } from './types'
import type { NodeClass } from '../core'

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

export function createTheme(override: PlanThemeOverride = {}): PlanTheme {
  const pins: PlanTheme['pins'] = { ...defaultTheme.pins }
  if (override.pins) {
    for (const [key, val] of Object.entries(override.pins)) {
      pins[key] = mergePin(pins[key] || defaultTheme.pinFallback, val)
    }
  }

  const nodeKeys = Object.keys(defaultTheme.nodes) as Array<NodeClass | 'default'>
  const nodes = { ...defaultTheme.nodes } as PlanTheme['nodes']
  if (override.nodes) {
    for (const key of nodeKeys) {
      if (override.nodes[key]) {
        nodes[key] = mergeNode(nodes[key], override.nodes[key])
      }
    }
  }

  return {
    pins,
    pinFallback: mergePin(defaultTheme.pinFallback, override.pinFallback),
    nodes,
    canvas: { ...defaultTheme.canvas, ...override.canvas },
    chrome: { ...defaultTheme.chrome, ...override.chrome },
  }
}

export function getPinColor(theme: PlanTheme, type: string): string {
  if (theme.pins[type]?.color) return theme.pins[type].color
  if (type && type !== 'wildcard' && type !== 'any') {
    let h = 0
    for (let i = 0; i < type.length; i++) h = (h * 31 + type.charCodeAt(i)) >>> 0
    return `hsl(${h % 360} 55% 55%)`
  }
  return theme.pinFallback.color
}

export function getPinLabel(theme: PlanTheme, type: string): string {
  return theme.pins[type]?.label ?? type
}

export function getNodeAppearance(theme: PlanTheme, nodeClass?: NodeClass | string) {
  const key = (nodeClass || 'default') as keyof PlanTheme['nodes']
  return theme.nodes[key] || theme.nodes.default
}
