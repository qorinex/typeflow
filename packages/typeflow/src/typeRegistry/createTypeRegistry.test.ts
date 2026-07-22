import { describe, expect, it } from 'vitest'
import { typeScheme, typeVar } from '../core'
import { createTypeRegistry } from './createTypeRegistry'
import { blueprintTypePack, bp } from '../presets/blueprint/pack'

describe('createTypeRegistry', () => {
  const registry = createTypeRegistry({ packs: [blueprintTypePack] })

  it('checks list formatting', () => {
    expect(registry.format(bp.list({ type: 'int' }))).toBe('list[int]')
    expect(registry.format(bp.list(typeVar(0)))).toBe('list[var(0)]')
  })

  it('formats maps with explicit and default string keys', () => {
    expect(registry.format(bp.map({ type: 'float' }))).toBe('map[str, float]')
    expect(registry.format(bp.map({ type: 'int' }, { type: 'str' }))).toBe('map[int, str]')
  })

  it('checks custom type formatting', () => {
    const scheme = typeScheme('hell', { e35dfs9: { type: 'str' } })
    expect(registry.format(scheme)).toBe('hell{e35dfs9: str}')
    expect(registry.colorKey(scheme)).toBe('hell')
  })

  it('gets color from inner type', () => {
    expect(registry.colorKey(bp.list({ type: 'float' }))).toBe('float')
    expect(registry.colorKey(bp.list(typeVar(0)))).toBe('var')
    expect(registry.colorKey(bp.list(bp.list({ type: 'str' })))).toBe('str')
  })

  it('uses type settings from last pack', () => {
    const custom = createTypeRegistry({
      packs: [
        blueprintTypePack,
        {
          id: 'mod',
          types: {
            list: {
              color: '#ffffff',
              label: 'List!',
              format: () => 'LIST',
            },
          },
        },
      ],
    })
    expect(custom.getDef('list')?.label).toBe('List!')
    expect(custom.format(bp.list({ type: 'int' }))).toBe('LIST')
  })
})
