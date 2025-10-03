import {
  getTypeString,
  isNamedType,
  isTypeVar,
  schemeTypeTag,
  type PinTypeScheme,
} from '../core'
import type {
  TypeDef,
  TypePack,
  TypeRegistry,
} from './types'

export type CreateTypeRegistryOptions = {
  packs: TypePack[]
}

function mergeDefs(packs: TypePack[]): Record<string, TypeDef> {
  const defs: Record<string, TypeDef> = {}
  for (const pack of packs) {
    for (const [key, partial] of Object.entries(pack.types)) {
      const name = partial.name ?? key
      defs[name] = { ...partial, name }
    }
  }
  return defs
}

export function createTypeRegistry(options: CreateTypeRegistryOptions): TypeRegistry {
  const defs = mergeDefs(options.packs)

  const getDef = (typeName: string) => defs[typeName]

  const format = (scheme: PinTypeScheme): string => {
    if (isTypeVar(scheme)) return `var(${scheme.groupIndex})`
    if (!isNamedType(scheme)) return getTypeString(scheme)

    const args = scheme.args
    if (!args || !Object.keys(args).length) return scheme.type

    const parts: Record<string, string> = {}
    for (const [k, v] of Object.entries(args)) {
      parts[k] = format(v)
    }

    const def = getDef(scheme.type)
    if (def?.format) return def.format(parts)

    return getTypeString(scheme)
  }

  const colorKey = (scheme: PinTypeScheme): string => {
    if (isTypeVar(scheme)) return 'var'
    if (!isNamedType(scheme)) return 'any'

    const def = getDef(scheme.type)
    if (def?.colorFrom && scheme.args?.[def.colorFrom]) {
      const child = scheme.args[def.colorFrom]
      if (isTypeVar(child)) return scheme.type
      return schemeTypeTag(child)
    }
    return scheme.type
  }

  return {
    getDef,
    format,
    colorKey,
  }
}

/** Build theme pin colors/labels from merged pack defs */
export function pinsFromPacks(
  packs: TypePack[],
): Record<string, { color: string; label: string }> {
  const defs = mergeDefs(packs)
  const pins: Record<string, { color: string; label: string }> = {}
  for (const def of Object.values(defs)) {
    pins[def.name] = {
      color: def.color ?? '#6b7280',
      label: def.label ?? def.name,
    }
  }
  return pins
}
