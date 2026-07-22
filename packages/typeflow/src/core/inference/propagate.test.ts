import { describe, expect, it } from 'vitest'
import type { NodeData, Pin } from '../index'
import { typeScheme, typeVar } from '../types/pin'
import { buildFlowElements } from '../helpers/buildFlow'
import { inferWildcards } from './propagate'

const pin = (name: string, valueSchema: Pin['valueSchema'], links: Pin['links'] = []): Pin => ({
  name,
  valueSchema,
  linkable: true,
  links,
})

describe('inferWildcards across generic nodes', () => {
  it('propagates List<Vehicle<Rocket>> through ForEach<T> into Vehicle<U>', () => {
    const vehicle = (kind: Pin['valueSchema']) => typeScheme('vehicle', { kind })
    const list = (item: Pin['valueSchema']) => typeScheme('list', { item })

    const nodes: NodeData[] = [
      {
        id: 'prepare', displayName: 'Prepare', type: 'prepare', x: 0, y: 0,
        inPins: [pin('vehicle', vehicle(typeVar(0)), [
          { inNode: 'prepare', inIdx: 0, outNode: 'foreach', outIdx: 0 },
        ])],
        outPins: [],
      },
      {
        id: 'source', displayName: 'Fleet', type: 'source', x: 0, y: 0,
        inPins: [],
        outPins: [pin('vehicles', list(vehicle({ type: 'rocket' })))],
      },
      {
        id: 'foreach', displayName: 'ForEach', type: 'foreach', x: 0, y: 0,
        inPins: [pin('items', list(typeVar(0)), [
          { inNode: 'foreach', inIdx: 0, outNode: 'source', outIdx: 0 },
        ])],
        outPins: [pin('item', typeVar(0))],
      },
    ]

    const edges = buildFlowElements(nodes).filter((element: any) => element.source)
    const result = inferWildcards(edges as any, nodes)

    expect(result.conflicts).toEqual([])
    expect(result.bindings.foreach?.[0]).toEqual(vehicle({ type: 'rocket' }))
    expect(result.bindings.prepare?.[0]).toEqual({ type: 'rocket' })
  })

  it('exposes unresolved composite aliases for display without using them as bindings', () => {
    const vehicle = (kind: Pin['valueSchema']) => typeScheme('vehicle', { kind })
    const nodes: NodeData[] = [
      {
        id: 'prepare', displayName: 'Prepare', type: 'prepare', x: 0, y: 0,
        inPins: [pin('vehicle', vehicle(typeVar(0)), [
          { inNode: 'prepare', inIdx: 0, outNode: 'foreach', outIdx: 0 },
        ])],
        outPins: [],
      },
      {
        id: 'foreach', displayName: 'ForEach', type: 'foreach', x: 0, y: 0,
        inPins: [pin('items', typeScheme('list', { item: typeVar(0) }))],
        outPins: [pin('item', typeVar(0))],
      },
    ]

    const edges = buildFlowElements(nodes).filter((element: any) => element.source)
    const result = inferWildcards(edges as any, nodes)

    expect(result.conflicts).toEqual([])
    expect(result.bindings).toEqual({})
    expect(result.displayBindings.foreach?.[0]).toEqual(vehicle(typeVar(0)))
  })

  it('propagates a partial composite through an arbitrary generic chain', () => {
    const vehicle = (kind: Pin['valueSchema']) => typeScheme('vehicle', { kind })
    const nodes: NodeData[] = [
      {
        id: 'prepare', displayName: 'Prepare', type: 'prepare', x: 0, y: 0,
        inPins: [pin('vehicle', vehicle(typeVar(0)), [
          { inNode: 'prepare', inIdx: 0, outNode: 'select', outIdx: 0 },
        ])],
        outPins: [],
      },
      {
        id: 'select', displayName: 'Select', type: 'select', x: 0, y: 0,
        inPins: [pin('left', typeVar(0), [
          { inNode: 'select', inIdx: 0, outNode: 'branch', outIdx: 0 },
        ]), pin('right', typeVar(0))],
        outPins: [pin('selected', typeVar(0))],
      },
      {
        id: 'branch', displayName: 'Branch', type: 'branch', x: 0, y: 0,
        inPins: [pin('value', typeVar(0))],
        outPins: [pin('true', typeVar(0)), pin('false', typeVar(0))],
      },
    ]

    const edges = buildFlowElements(nodes).filter((element: any) => element.source)
    const result = inferWildcards(edges as any, nodes)

    expect(result.bindings).toEqual({})
    expect(result.displayBindings.select?.[0]).toEqual(vehicle(typeVar(0)))
    expect(result.displayBindings.branch?.[0]).toEqual(vehicle(typeVar(0)))
  })

  it('propagates list[str] through scalar vars and back into list<T>', () => {
    const list = (item: Pin['valueSchema']) => typeScheme('list', { item })
    const nodes: NodeData[] = [
      {
        id: 'render', displayName: 'Render', type: 'sink', x: 0, y: 0,
        inPins: [pin('routes', list(typeVar(0)), [
          { inNode: 'render', inIdx: 0, outNode: 'recent', outIdx: 0 },
        ])],
        outPins: [],
      },
      {
        id: 'recent', displayName: 'Recent', type: 'func', x: 0, y: 0,
        inPins: [pin('route', typeVar(0), [
          { inNode: 'recent', inIdx: 0, outNode: 'selected', outIdx: 0 },
        ])],
        outPins: [pin('routes', list(typeVar(0)))],
      },
      {
        id: 'selected', displayName: 'Selected', type: 'func', x: 0, y: 0,
        inPins: [pin('route', typeVar(0), [
          { inNode: 'selected', inIdx: 0, outNode: 'update', outIdx: 0 },
        ])],
        outPins: [pin('route', typeVar(0))],
      },
      {
        id: 'update', displayName: 'Update', type: 'func', x: 0, y: 0,
        inPins: [pin('routes', list(typeVar(0)), [
          { inNode: 'update', inIdx: 0, outNode: 'source', outIdx: 0 },
        ])],
        outPins: [pin('active route', typeVar(0))],
      },
      {
        id: 'source', displayName: 'Routes', type: 'source', x: 0, y: 0,
        inPins: [],
        outPins: [pin('routes', list({ type: 'str' }))],
      },
    ]

    const edges = buildFlowElements(nodes).filter((element: any) => element.source)
    const result = inferWildcards(edges as any, nodes)

    expect(result.conflicts).toEqual([])
    expect(result.bindings.update?.[0]).toEqual({ type: 'str' })
    expect(result.bindings.selected?.[0]).toEqual({ type: 'str' })
    expect(result.bindings.recent?.[0]).toEqual({ type: 'str' })
    expect(result.bindings.render?.[0]).toEqual({ type: 'str' })
  })
})
