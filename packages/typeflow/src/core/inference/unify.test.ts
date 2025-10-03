import { describe, expect, it } from 'vitest'
import { typeScheme, typeVar, type PinTypeScheme } from '../types/pin'
import { applyBindings, findTypeVars, schemesEqual, unify } from './unify'

describe('unify', () => {
  it('same primitives are fine', () => {
    const r = unify({ type: 'int' }, { type: 'int' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.scheme).toEqual({ type: 'int' })
  })

  it('int vs str fails', () => {
    expect(unify({ type: 'int' }, { type: 'str' }).ok).toBe(false)
  })

  it('any collapses to the other side', () => {
    const r = unify({ type: 'any' }, { type: 'float' })
    expect(r).toEqual({ ok: true, scheme: { type: 'float' } })
  })

  it('walks into list args.item', () => {
    const r = unify(
      typeScheme('list', { item: { type: 'any' } }),
      typeScheme('list', { item: { type: 'int' } }),
    )
    expect(r).toEqual({
      ok: true,
      scheme: typeScheme('list', { item: { type: 'int' } }),
    })
  })

  it('walks free custom arg keys', () => {
    const r = unify(
      typeScheme('hell', { e35dfs9: typeVar(0) }),
      typeScheme('hell', { e35dfs9: { type: 'str' } }),
      {
        resolveVar: () => undefined,
        bindVar: () => true,
      },
    )
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.scheme).toEqual(typeScheme('hell', { e35dfs9: { type: 'str' } }))
    }
  })

  it('can bind a free var through ctx', () => {
    const bound: Record<number, PinTypeScheme> = {}

    const r = unify(typeVar(0), { type: 'str' }, {
      resolveVar: () => undefined,
      bindVar: (_, idx, scheme) => {
        bound[idx] = scheme
        return true
      },
    })

    expect(r.ok).toBe(true)
    expect(bound[0]).toEqual({ type: 'str' })
  })
})

describe('schemesEqual / type vars', () => {
  it('struct equality is field sensitive by args', () => {
    const a = typeScheme('struct', { hp: { type: 'int' } })
    const b = typeScheme('struct', { hp: { type: 'int' } })
    const c = typeScheme('struct', { hp: { type: 'float' } })

    expect(schemesEqual(a, b)).toBe(true)
    expect(schemesEqual(a, c)).toBe(false)
  })

  it('finds and replaces vars inside list args', () => {
    const open = typeScheme('list', { item: typeVar(0) })

    expect(findTypeVars(open)).toEqual([{ groupIndex: 0 }])
    expect(applyBindings(open, { 0: { type: 'float' } })).toEqual(
      typeScheme('list', { item: { type: 'float' } }),
    )
  })
})
