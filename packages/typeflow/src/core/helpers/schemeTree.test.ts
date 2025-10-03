import { describe, expect, it } from 'vitest'
import { typeScheme, typeVar } from '../types/pin'
import { getSchemeChildren, setSchemeChildren } from './schemeTree'

describe('schemeTree', () => {
  it('type vars have no children', () => {
    expect(getSchemeChildren(typeVar(0))).toEqual([])
  })

  it('walks free keys under args', () => {
    const kids = getSchemeChildren(
      typeScheme('hell', { e35dfs9: { type: 'int' }, other: typeVar(0) }),
    )
    expect(kids).toEqual([
      { key: 'e35dfs9', scheme: { type: 'int' } },
      { key: 'other', scheme: typeVar(0) },
    ])
  })

  it('gets children from list and struct args', () => {
    const listKids = getSchemeChildren(typeScheme('list', { item: { type: 'int' } }))
    expect(listKids).toEqual([{ key: 'item', scheme: { type: 'int' } }])

    const structKids = getSchemeChildren(
      typeScheme('struct', { name: { type: 'str' }, age: { type: 'int' } }),
    )
    expect(structKids.map((c) => c.key).sort()).toEqual(['age', 'name'])
  })

  it('setSchemeChildren writes values back by those keys', () => {
    const updated = setSchemeChildren(
      typeScheme('list', { item: { type: 'any' }, id: { type: 'any' } }),
      {
        item: { type: 'float' },
        id: { type: 'str' },
      },
    )

    expect(updated).toEqual({
      type: 'list',
      args: {
        item: { type: 'float' },
        id: { type: 'str' },
      },
    })
  })
})
