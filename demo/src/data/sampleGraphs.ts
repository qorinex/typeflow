import type { NodeData, Pin, PinLink, PinTypeScheme } from 'typeflow/core'
import { typeVar } from 'typeflow/core'

export type SampleGraph = {
  id: string
  name: string
  description?: string
  nodes: NodeData[]
}

function pin(name: string, schema: PinTypeScheme, links: PinLink[] = []): Pin {
  return { name, linkable: true, valueSchema: schema, links }
}

function link(inNode: string, inIdx: number, outNode: string, outIdx: number): PinLink {
  return { inNode, inIdx, outNode, outIdx }
}

const wc = (groupIndex: number) => typeVar(groupIndex)
const list = (inner: PinTypeScheme): PinTypeScheme => ({ type: 'list', item: inner })
const mapOf = (inner: PinTypeScheme): PinTypeScheme => ({ type: 'map', entry: inner })
const tuple = (...items: PinTypeScheme[]): PinTypeScheme => ({ type: 'tuple', items })
const structOf = (fields: Record<string, PinTypeScheme>): PinTypeScheme => ({
  type: 'struct',
  fields,
})
const option = (inner: PinTypeScheme): PinTypeScheme => ({ type: 'option', item: inner })
const result = (ok: PinTypeScheme, err: PinTypeScheme): PinTypeScheme => ({
  type: 'result',
  slots: { ok, err },
})

const uid = () => crypto.randomUUID()

const id = {
  streamSource: uid(),
  branchLeft: uid(),
  branchRight: uid(),
  join: uid(),
  needFloats: uid(),
  names: uid(),
  scores: uid(),
  zip: uid(),
  unzip: uid(),
  userId: uid(),
  passId: uid(),
  wrapOk: uid(),
  mapResult: uid(),
  unwrapResult: uid(),
  wrapSome: uid(),
  mapOption: uid(),
  mapSource: uid(),
  mapPass: uid(),
  mapSink: uid(),
  tupleSource: uid(),
  tuplePass: uid(),
  tupleSink: uid(),
  structSource: uid(),
  structPass: uid(),
  structSink: uid(),
  makeInts: uid(),
  makeStrs: uid(),
  badJoin: uid(),
  consume: uid(),
  boundInt: uid(),
  pass: uid(),
  freeStr: uid(),
}

export const multiDirectionGraph: SampleGraph = {
  id: uid(),
  name: 'Multi-direction',
  description: 'some desc',
  nodes: [
    {
      id: id.streamSource,
      displayName: 'Stream',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 120,
      inPins: [],
      outPins: [pin('out', list(wc(0)))],

    },
    {
      id: id.branchLeft,
      displayName: 'Left',
      type: 'pass',
      nodeClass: 'func',
      x: 280,
      y: 40,
      inPins: [pin('in', list(wc(0)), [link(id.branchLeft, 0, id.streamSource, 0)])],
      outPins: [pin('out', list(wc(0)))],

    },
    {
      id: id.branchRight,
      displayName: 'Right',
      type: 'pass',
      nodeClass: 'func',
      x: 280,
      y: 200,
      inPins: [pin('in', list(wc(0)), [link(id.branchRight, 0, id.streamSource, 0)])],
      outPins: [pin('out', list(wc(0)))],

    },
    {
      id: id.join,
      displayName: 'Join',
      type: 'join',
      nodeClass: 'func',
      x: 520,
      y: 120,
      inPins: [pin('left', list(wc(0)), [link(id.join, 0, id.branchLeft, 0)]), pin('right', list(wc(0)), [link(id.join, 1, id.branchRight, 0)])],
      outPins: [pin('out', list(wc(0)))],

    },
    {
      id: id.needFloats,
      displayName: 'Need floats',
      type: 'sink',
      nodeClass: 'proc',
      x: 760,
      y: 120,
      inPins: [pin('items', list({ type: 'float' }), [link(id.needFloats, 0, id.join, 0)])],
      outPins: [],

    },

    {
      id: id.names,
      displayName: 'Names',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 380,
      inPins: [],
      outPins: [pin('out', list({ type: 'str' }))],

    },
    {
      id: id.scores,
      displayName: 'Scores',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 500,
      inPins: [],
      outPins: [pin('out', list({ type: 'int' }))],

    },
    {
      id: id.zip,
      displayName: 'Zip',
      type: 'zip',
      nodeClass: 'func',
      x: 300,
      y: 420,
      inPins: [pin('left', list(wc(0)), [link(id.zip, 0, id.names, 0)]), pin('right', list(wc(1)), [link(id.zip, 1, id.scores, 0)])],
      outPins: [pin('pairs', list(tuple(wc(0), wc(1))))],

    },
    {
      id: id.unzip,
      displayName: 'Unzip',
      type: 'unzip',
      nodeClass: 'func',
      x: 560,
      y: 420,
      inPins: [pin('pairs', list(tuple(wc(0), wc(1))), [link(id.unzip, 0, id.zip, 0)])],
      outPins: [pin('left', list(wc(0))), pin('right', list(wc(1)))],

    },

    {
      id: id.userId,
      displayName: 'Name',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 640,
      inPins: [],
      outPins: [pin('out', { type: 'str' })],

    },
    {
      id: id.passId,
      displayName: 'Pass',
      type: 'pass',
      nodeClass: 'func',
      x: 260,
      y: 640,
      inPins: [pin('in', wc(0), [link(id.passId, 0, id.userId, 0)])],
      outPins: [pin('out', wc(0))],

    },
    {
      id: id.wrapOk,
      displayName: 'Ok',
      type: 'result-ok',
      nodeClass: 'func',
      x: 480,
      y: 600,
      inPins: [pin('value', wc(0), [link(id.wrapOk, 0, id.passId, 0)])],
      outPins: [pin('out', result(wc(0), { type: 'str' }))],

    },
    {
      id: id.mapResult,
      displayName: 'Map result',
      type: 'result-map',
      nodeClass: 'func',
      x: 790,
      y: 600,
      inPins: [pin('in', result(wc(0), wc(1)), [link(id.mapResult, 0, id.wrapOk, 0)])],
      outPins: [pin('out', result(wc(0), wc(1)))],

    },
    {
      id: id.unwrapResult,
      displayName: 'Unwrap',
      type: 'result-unwrap',
      nodeClass: 'func',
      x: 1260,
      y: 600,
      inPins: [pin('in', result(wc(0), wc(1)), [link(id.unwrapResult, 0, id.mapResult, 0)])],
      outPins: [pin('ok', wc(0)), pin('err', wc(1))],

    },
    {
      id: id.wrapSome,
      displayName: 'Some',
      type: 'option-some',
      nodeClass: 'func',
      x: 480,
      y: 740,
      inPins: [pin('value', wc(0), [link(id.wrapSome, 0, id.passId, 0)])],
      outPins: [pin('out', option(wc(0)))],

    },
    {
      id: id.mapOption,
      displayName: 'Map option',
      type: 'option-map',
      nodeClass: 'func',
      x: 720,
      y: 740,
      inPins: [pin('in', option(wc(0)), [link(id.mapOption, 0, id.wrapSome, 0)])],
      outPins: [pin('out', option(wc(0)))],

    },

    {
      id: id.mapSource,
      displayName: 'Dict',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 900,
      inPins: [],
      outPins: [pin('out', mapOf({ type: 'float' }))],

    },
    {
      id: id.mapPass,
      displayName: 'Pass map',
      type: 'pass',
      nodeClass: 'func',
      x: 280,
      y: 900,
      inPins: [pin('in', mapOf(wc(0)), [link(id.mapPass, 0, id.mapSource, 0)])],
      outPins: [pin('out', mapOf(wc(0)))],

    },
    {
      id: id.mapSink,
      displayName: 'Use map',
      type: 'sink',
      nodeClass: 'proc',
      x: 540,
      y: 900,
      inPins: [pin('data', mapOf({ type: 'float' }), [link(id.mapSink, 0, id.mapPass, 0)])],
      outPins: [],

    },

    {
      id: id.tupleSource,
      displayName: 'Pair',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 1040,
      inPins: [],
      outPins: [pin('out', tuple({ type: 'int' }, { type: 'str' }))],

    },
    {
      id: id.tuplePass,
      displayName: 'Pass tuple',
      type: 'pass',
      nodeClass: 'func',
      x: 280,
      y: 1040,
      inPins: [pin('in', tuple(wc(0), wc(1)), [link(id.tuplePass, 0, id.tupleSource, 0)])],
      outPins: [pin('out', tuple(wc(0), wc(1)))],

    },
    {
      id: id.tupleSink,
      displayName: 'Use tuple',
      type: 'sink',
      nodeClass: 'proc',
      x: 570,
      y: 1040,
      inPins: [pin('pair', tuple({ type: 'int' }, { type: 'str' }), [link(id.tupleSink, 0, id.tuplePass, 0)])],
      outPins: [],

    },

    {
      id: id.structSource,
      displayName: 'Person',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 1180,
      inPins: [],
      outPins: [
        pin(
          'out',
          structOf({
            name: { type: 'str' },
            age: { type: 'int' },
          }),
        ),
      ],

    },
    {
      id: id.structPass,
      displayName: 'Pass struct',
      type: 'pass',
      nodeClass: 'func',
      x: 280,
      y: 1180,
      inPins: [
        pin(
          'in',
          structOf({
            name: wc(0),
            age: wc(1),
          }),
          [link(id.structPass, 0, id.structSource, 0)],
        ),
      ],
      outPins: [
        pin(
          'out',
          structOf({
            name: wc(0),
            age: wc(1),
          }),
        ),
      ],

    },
    {
      id: id.structSink,
      displayName: 'Use struct',
      type: 'sink',
      nodeClass: 'proc',
      x: 790,
      y: 1180,
      inPins: [
        pin(
          'person',
          structOf({
            name: { type: 'str' },
            age: { type: 'int' },
          }),
          [link(id.structSink, 0, id.structPass, 0)],
        ),
      ],
      outPins: [],

    },
  ],
}

export const conflictGraph: SampleGraph = {
  id: uid(),
  name: 'Conflict',
  description: 'Incompatible list types on one join',
  nodes: [
    {
      id: id.makeInts,
      displayName: 'Ints',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 80,
      inPins: [],
      outPins: [pin('out', list({ type: 'int' }))],

    },
    {
      id: id.makeStrs,
      displayName: 'Strings',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 280,
      inPins: [],
      outPins: [pin('out', list({ type: 'str' }))],

    },
    {
      id: id.badJoin,
      displayName: 'Join',
      type: 'join',
      nodeClass: 'func',
      x: 360,
      y: 160,
      inPins: [pin('left', list(wc(0)), [link(id.badJoin, 0, id.makeInts, 0)]), pin('right', list(wc(0)), [link(id.badJoin, 1, id.makeStrs, 0)])],
      outPins: [pin('out', list(wc(0)))],

    },
    {
      id: id.consume,
      displayName: 'Consume',
      type: 'sink',
      nodeClass: 'proc',
      x: 640,
      y: 160,
      inPins: [pin('items', list(wc(0)), [link(id.consume, 0, id.badJoin, 0)])],
      outPins: [],

    },
    {
      id: id.boundInt,
      displayName: 'Int',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 480,
      inPins: [],
      outPins: [pin('out', { type: 'int' })],

    },
    {
      id: id.pass,
      displayName: 'Pass',
      type: 'pass',
      nodeClass: 'func',
      x: 280,
      y: 480,
      inPins: [pin('in', wc(0), [link(id.pass, 0, id.boundInt, 0)])],
      outPins: [pin('out', wc(0))],

    },
    {
      id: id.freeStr,
      displayName: 'String',
      type: 'const',
      nodeClass: 'const',
      x: 40,
      y: 600,
      inPins: [],
      outPins: [pin('out', { type: 'str' })],

    },
  ],
}

export const sampleGraphs: SampleGraph[] = [multiDirectionGraph, conflictGraph]
