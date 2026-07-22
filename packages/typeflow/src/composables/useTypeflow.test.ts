import { effectScope, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NodeData } from '../core'
import { useTypeflow } from './useTypeflow'

afterEach(() => vi.restoreAllMocks())

describe('useTypeflow element synchronization', () => {
  it('preserves live position, dimensions, and selection when graph data changes', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const nodes = ref<NodeData[]>([{
      id: 'node', displayName: 'Before', type: 'test', x: 10, y: 20,
      inPins: [], outPins: [],
    }])
    const scope = effectScope()
    const flow = scope.run(() => useTypeflow({ nodes }))!
    const liveNode = flow.elements.value[0] as any
    liveNode.position = { x: 240, y: 360 }
    liveNode.dimensions = { width: 220, height: 96 }
    liveNode.selected = true

    nodes.value = [{ ...nodes.value[0], displayName: 'After' }]
    await nextTick()

    const rebuilt = flow.elements.value[0] as any
    expect(rebuilt.data.displayName).toBe('After')
    expect(rebuilt.position).toEqual({ x: 240, y: 360 })
    expect(rebuilt.dimensions).toEqual({ width: 220, height: 96 })
    expect(rebuilt.selected).toBe(true)
    scope.stop()
  })
})
