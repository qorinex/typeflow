import type { PinTypeScheme } from '../types/pin'
import { isTypeVar } from '../types/pin'

export type TypeChild = {
  key: string
  scheme: PinTypeScheme
}

export function getSchemeChildren(scheme: PinTypeScheme): TypeChild[] {
  if (isTypeVar(scheme) || !scheme.args) return []
  return Object.entries(scheme.args).map(([key, child]) => ({
    key,
    scheme: child,
  }))
}

export function setSchemeChildren(
  scheme: PinTypeScheme,
  byKey: Record<string, PinTypeScheme>,
): PinTypeScheme {
  if (isTypeVar(scheme)) return scheme

  const next = { ...scheme }
  const args = { ...(scheme.args || {}) }
  for (const [k, v] of Object.entries(byKey)) {
    args[k] = v
  }
  next.args = args
  return next
}
