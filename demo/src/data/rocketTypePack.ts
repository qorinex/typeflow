import type { FlowTheme, TypePack } from '@qorinex/typeflow'

export const rocketTypePack: TypePack = {
  id: 'demo-rocket',
  types: {
    rocket: { color: '#fb923c', label: 'rocket', icon: 'primitive' },
    'rocket-fuel': { color: '#4ade80', label: 'rocket fuel', icon: 'primitive' },
    car: { color: '#38bdf8', label: 'car', icon: 'primitive' },
    plane: { color: '#a78bfa', label: 'plane', icon: 'primitive' },
    boat: { color: '#22d3ee', label: 'boat', icon: 'primitive' },
    diesel: { color: '#a3a3a3', label: 'diesel', icon: 'primitive' },
    battery: { color: '#facc15', label: 'battery', icon: 'primitive' },
    potion: { color: '#e879f9', label: 'potion', icon: 'primitive' },
    vehicle: {
      color: '#6b7280',
      label: 'vehicle',
      icon: 'primitive',
      colorFrom: 'kind',
      format: (parts) => (parts.kind ? `vehicle[${parts.kind}]` : 'vehicle'),
    },
    fuel: {
      color: '#6b7280',
      label: 'fuel',
      icon: 'primitive',
      colorFrom: 'kind',
      format: (parts) => (parts.kind ? `fuel[${parts.kind}]` : 'fuel'),
    },
    prepared: {
      color: '#6b7280',
      label: 'prepared',
      icon: 'tuple',
      format: (parts) => `prepared[${parts.vehicle ?? '?'}, ${parts.fuel ?? '?'}]`,
    },
  },
}

function emojiIcon(emoji: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><text x="17" y="24" text-anchor="middle" font-family="Segoe UI Emoji, Apple Color Emoji, sans-serif" font-size="22">${emoji}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function applyRocketNodeIcons(theme: FlowTheme) {
  const classes: Array<[string, keyof typeof theme.nodes, string]> = [
    ['demo-launch-button', 'event', '🎮'],
    ['demo-prepare-launch', 'func', '🛠️'],
    ['demo-launch', 'proc', '🚀'],
    ['demo-launch-error', 'proc', '⚠️'],
    ['demo-moon-rocket', 'const', '🚀'],
    ['demo-sports-car', 'const', '🏎️'],
    ['demo-cargo-plane', 'const', '✈️'],
    ['demo-pirate-ship', 'const', '⛵'],
    ['demo-rocket-fuel', 'const', '🛢️'],
    ['demo-diesel', 'const', '⛽'],
    ['demo-battery', 'const', '🔋'],
    ['demo-potion', 'const', '🧪'],
  ]

  for (const [name, base, emoji] of classes) {
    theme.nodes[name] = { ...theme.nodes[base], icon: emojiIcon(emoji), iconSize: '1.65rem' }
  }
}
