import type { PinTypeScheme } from './pin'
import { isWildcard } from './pin'

export type TypeChild = {
  key: string
  scheme: PinTypeScheme
}

export interface TypeDef {
  name: string
  color?: string
  getChildren?: (scheme: PinTypeScheme) => TypeChild[]
  setChildren?: (scheme: PinTypeScheme, byKey: Record<string, PinTypeScheme>) => PinTypeScheme
}

export function getSchemeChildren(
  scheme: PinTypeScheme,
  registry: TypeRegistry,
): TypeChild[] {
  if (isWildcard(scheme)) return []

  const def = registry.get(scheme.type)
  if (def?.getChildren) return def.getChildren(scheme)

  return autoChildren(scheme)
}

export function autoChildren(scheme: PinTypeScheme): TypeChild[] {
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
  registry: TypeRegistry,
): PinTypeScheme {
  const def = registry.get(scheme.type)
  if (def?.setChildren) return def.setChildren(scheme, byKey)

  const next: PinTypeScheme = { ...scheme }

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

export class TypeRegistry {
  private defs = new Map<string, TypeDef>()

  register(def: TypeDef): this {
    this.defs.set(def.name, def)
    return this
  }

  registerMany(defs: TypeDef[]): this {
    defs.forEach((d) => this.register(d))
    return this
  }

  get(name: string): TypeDef | undefined {
    return this.defs.get(name)
  }

  has(name: string): boolean {
    return this.defs.has(name)
  }

  names(): string[] {
    return [...this.defs.keys()]
  }

  colorOf(name: string): string | undefined {
    return this.defs.get(name)?.color
  }
}

export function createDefaultRegistry(): TypeRegistry {
  const r = new TypeRegistry()

  const atomic = (name: string, color?: string): TypeDef => ({ name, color })

  r.registerMany([
    atomic('exec', '#e4e4e7'),
    atomic('any', '#6b7280'),
    atomic('bool', '#eab308'),
    atomic('int', '#3b82f6'),
    atomic('float', '#22c55e'),
    atomic('str', '#f97316'),
    atomic('time', '#a855f7'),
    atomic('duration', '#7E22CE'),
    atomic('wildcard', '#6b7280'),
    {
      name: 'list',
      color: '#6366f1',
      getChildren: (s) => (s.item ? [{ key: 'item', scheme: s.item }] : []),
      setChildren: (s, by) => ({ ...s, type: 'list', item: by.item ?? s.item! }),
    },
    {
      name: 'map',
      color: '#ef4444',
      getChildren: (s) => (s.entry ? [{ key: 'entry', scheme: s.entry }] : []),
      setChildren: (s, by) => ({ ...s, type: 'map', entry: by.entry ?? s.entry! }),
    },
    {
      name: 'tuple',
      color: '#ec4899',
      getChildren: (s) =>
        (s.items || []).map((scheme, i) => ({ key: `items:${i}`, scheme })),
      setChildren: (s, by) => ({
        ...s,
        type: 'tuple',
        items: (s.items || []).map((it, i) => by[`items:${i}`] ?? it),
      }),
    },
    {
      name: 'struct',
      color: '#14b8a6',
      getChildren: (s) =>
        Object.entries(s.fields || {}).map(([key, scheme]) => ({
          key: `field:${key}`,
          scheme,
        })),
      setChildren: (s, by) => {
        const fields: Record<string, PinTypeScheme> = {}
        for (const key of Object.keys(s.fields || {})) {
          fields[key] = by[`field:${key}`] ?? s.fields![key]
        }
        return { ...s, type: 'struct', fields }
      },
    },
    {
      name: 'embedded-macro',
      color: '#ef4444',
      getChildren: (s) => {
        const out: TypeChild[] = []
        ;(s.input || []).forEach((p, i) => out.push({ key: `input:${i}`, scheme: p.schema }))
        ;(s.output || []).forEach((p, i) => out.push({ key: `output:${i}`, scheme: p.schema }))
        return out
      },
      setChildren: (s, by) => ({
        ...s,
        type: 'embedded-macro',
        input: (s.input || []).map((p, i) => ({ ...p, schema: by[`input:${i}`] ?? p.schema })),
        output: (s.output || []).map((p, i) => ({
          ...p,
          schema: by[`output:${i}`] ?? p.schema,
        })),
      }),
    },
    {
      name: 'result',
      color: '#f59e0b',
    },
    {
      name: 'option',
      color: '#14b8a6',
      getChildren: (s) => (s.item ? [{ key: 'item', scheme: s.item }] : []),
      setChildren: (s, by) => ({ ...s, type: 'option', item: by.item ?? s.item! }),
    },
  ])

  return r
}

let sharedRegistry = createDefaultRegistry()

export function getTypeRegistry(): TypeRegistry {
  return sharedRegistry
}

export function setTypeRegistry(registry: TypeRegistry) {
  sharedRegistry = registry
}

export function resetTypeRegistry() {
  sharedRegistry = createDefaultRegistry()
}
