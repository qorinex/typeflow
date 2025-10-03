import type { PinTypeScheme } from '../core/types/pin'

export type TypeDef = {
  name: string
  label?: string
  color?: string
  colorFrom?: string
  icon?: string
  format?: (parts: Record<string, string>) => string
}

export type TypePack = {
  id: string
  types: Record<string, Omit<TypeDef, 'name'> & { name?: string }>
}

export type TypeRegistry = {
  getDef: (typeName: string) => TypeDef | undefined
  format: (scheme: PinTypeScheme) => string
  colorKey: (scheme: PinTypeScheme) => string
}
