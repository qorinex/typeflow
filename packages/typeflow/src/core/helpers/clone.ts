export function cloneDeep<T>(value: T): T {
  if (value === null || value === undefined) return value
  try {
    return JSON.parse(JSON.stringify(value)) as T
  } catch {
    if (typeof value !== 'object') return value
    if (Array.isArray(value)) return value.map((v) => cloneDeep(v)) as T
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value as object)) {
      out[key] = cloneDeep((value as Record<string, unknown>)[key])
    }
    return out as T
  }
}
