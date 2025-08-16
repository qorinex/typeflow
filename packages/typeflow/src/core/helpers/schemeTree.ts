import type { NamedTypeScheme, PinTypeScheme } from '../types/pin'
import { isTypeVar } from '../types/pin'

export type TypeChild = {
  key: string
  scheme: PinTypeScheme
}

export function getSchemeChildren(scheme: PinTypeScheme): TypeChild[] {
  if (isTypeVar(scheme)) return []
  return autoChildren(scheme)
}

export function autoChildren(scheme: NamedTypeScheme): TypeChild[] {
  const out: TypeChild[] = []

  if (scheme.slots) {
    for (const [key, child] of Object.entries(scheme.slots)) {
      out.push({ key: `slot:${key}`, scheme: child })
    }
  }
  if (scheme.fields) {
    for (const [key, child] of Object.entries(scheme.fields)) {
      out.push({ key: `field:${key}`, scheme: child })
    }
  }
  if (scheme.item) out.push({ key: 'item', scheme: scheme.item })
  if (scheme.entry) out.push({ key: 'entry', scheme: scheme.entry })
  if (scheme.items) {
    scheme.items.forEach((child, i) => out.push({ key: `items:${i}`, scheme: child }))
  }
  if (scheme.input) {
    scheme.input.forEach((p, i) => out.push({ key: `input:${i}`, scheme: p.schema }))
  }
  if (scheme.output) {
    scheme.output.forEach((p, i) => out.push({ key: `output:${i}`, scheme: p.schema }))
  }

  return out
}

export function setSchemeChildren(
  scheme: PinTypeScheme,
  byKey: Record<string, PinTypeScheme>,
): PinTypeScheme {
  if (isTypeVar(scheme)) return scheme

  const next: NamedTypeScheme = { ...scheme }

  if (scheme.slots || Object.keys(byKey).some((k) => k.startsWith('slot:'))) {
    const slots = { ...(scheme.slots || {}) }
    for (const [k, v] of Object.entries(byKey)) {
      if (k.startsWith('slot:')) slots[k.slice(5)] = v
    }
    next.slots = slots
  }
  if (scheme.fields || Object.keys(byKey).some((k) => k.startsWith('field:'))) {
    const fields = { ...(scheme.fields || {}) }
    for (const [k, v] of Object.entries(byKey)) {
      if (k.startsWith('field:')) fields[k.slice(6)] = v
    }
    next.fields = fields
  }
  if (byKey.item) next.item = byKey.item
  if (byKey.entry) next.entry = byKey.entry
  if (scheme.items || Object.keys(byKey).some((k) => k.startsWith('items:'))) {
    const len = scheme.items?.length ?? 0
    const maxIdx = Math.max(
      len - 1,
      ...Object.keys(byKey)
        .filter((k) => k.startsWith('items:'))
        .map((k) => Number(k.slice(6))),
    )
    const items = [...(scheme.items || [])]
    for (let i = 0; i <= maxIdx; i++) {
      items[i] = byKey[`items:${i}`] ?? items[i]
    }
    next.items = items
  }
  if (scheme.input || Object.keys(byKey).some((k) => k.startsWith('input:'))) {
    next.input = (scheme.input || []).map((p, i) => ({
      ...p,
      schema: byKey[`input:${i}`] ?? p.schema,
    }))
  }
  if (scheme.output || Object.keys(byKey).some((k) => k.startsWith('output:'))) {
    next.output = (scheme.output || []).map((p, i) => ({
      ...p,
      schema: byKey[`output:${i}`] ?? p.schema,
    }))
  }

  return next
}
