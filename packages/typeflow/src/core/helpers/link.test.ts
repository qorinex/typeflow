import { describe, expect, it } from 'vitest'
import { dataToPinId } from './pin'
import {
  connectionToLinkRef,
  edgeIdToLink,
  linkToEdgeId,
} from './link'

function handle(dir: 'in' | 'out', idx: number, nodeId: string, type = 'int') {
  return dataToPinId(dir, idx, nodeId, type)
}

describe('connectionToLinkRef', () => {

  it('drag from in-pin to out-pin', () => {
    const link = connectionToLinkRef({
      source: 'nodeA',
      target: 'nodeB',
      sourceHandle: handle('in', 0, 'nodeA'),
      targetHandle: handle('out', 1, 'nodeB'),
    })

    expect(link).toEqual({
      inNode: 'nodeA',
      inIdx: 0,
      outNode: 'nodeB',
      outIdx: 1,
    })
  })

  it('drag from out-pin to in-pin (other way around)', () => {
    const link = connectionToLinkRef({
      source: 'nodeA',
      target: 'nodeB',
      sourceHandle: handle('out', 1, 'nodeA'),
      targetHandle: handle('in', 0, 'nodeB'),
    })

    expect(link).toEqual({
      inNode: 'nodeB',
      inIdx: 0,
      outNode: 'nodeA',
      outIdx: 1,
    })
  })

  it('two inputs cannot connect', () => {
    const link = connectionToLinkRef({
      source: 'nodeA',
      target: 'nodeB',
      sourceHandle: handle('in', 0, 'nodeA'),
      targetHandle: handle('in', 0, 'nodeB'),
    })
    expect(link).toBeNull()
  })
})

describe('edge ids', () => {
  it('keeps node ids after encoding and decoding', () => {
    const link = {
      outNode: 'group/out',
      outIdx: 2,
      inNode: 'node in',
      inIdx: 0,
    }

    expect(edgeIdToLink(linkToEdgeId(link))).toEqual(link)
  })
})
