import type { NodeData, Pin, PinLink, PinTypeScheme } from '@qorinex/typeflow/core'
import { typeVar } from '@qorinex/typeflow/core'
import { bp } from '@qorinex/typeflow/presets/blueprint'

export type SampleGraph = {
  id: string
  name: string
  description?: string
  nodes: NodeData[]
  autoConnect?: Array<{
    delay: number
    fromNode: string
    fromPin: number
    toNode: string
    toPin: number
  }>
  challenge?: {
    level: string
    title: string
    description: string
    completeText: string
    connections: Array<{
      fromType: string
      fromPin: number
      toType: string
      toPin: number
    }>
  }
}

function pin(name: string, schema: PinTypeScheme, links: PinLink[] = []): Pin {
  return { name, linkable: true, valueSchema: schema, links }
}

function link(inNode: string, inIdx: number, outNode: string, outIdx: number): PinLink {
  return { inNode, inIdx, outNode, outIdx }
}

/** wildcard */
const wc = (groupIndex: number) => typeVar(groupIndex)
const { list, map: mapOf, tuple, struct: structOf } = bp
const vehicle = (kind: PinTypeScheme) => bp.t('vehicle', { kind })
const fuel = (kind: PinTypeScheme) => bp.t('fuel', { kind })
const prepared = (vehicleKind: PinTypeScheme, fuelKind: PinTypeScheme) =>
  bp.t('prepared', { vehicle: vehicleKind, fuel: fuelKind })

const uid = () => crypto.randomUUID()

const challengeId = {
  launchButton: uid(), prepare: uid(), launch: uid(), error: uid(),
  rocket: uid(), car: uid(), plane: uid(), boat: uid(),
  rocketFuel: uid(), diesel: uid(), battery: uid(), potion: uid(),
}

export const guidedGraph: SampleGraph = {
  id: uid(),
  name: 'Launch challenge',
  description: 'Choose the right parts and launch the rocket',
  challenge: {
    level: 'Blueprint challenge',
    title: 'Launch the rocket',
    description: 'Connect the execution paths and choose parts that satisfy Launch. Prepare Launch propagates its generic vehicle and fuel types into Prepared<TVehicle, TFuel>.',
    completeText: 'Launch accepted Prepared<Rocket, RocketFuel>. Both generic types propagated through Prepare Launch.',
    connections: [
      { fromType: 'launch-button', fromPin: 0, toType: 'prepare-launch', toPin: 0 },
      { fromType: 'moon-rocket', fromPin: 0, toType: 'prepare-launch', toPin: 1 },
      { fromType: 'rocket-fuel', fromPin: 0, toType: 'prepare-launch', toPin: 2 },
      { fromType: 'prepare-launch', fromPin: 0, toType: 'launch', toPin: 0 },
      { fromType: 'prepare-launch', fromPin: 1, toType: 'show-wrong-parts', toPin: 0 },
      { fromType: 'prepare-launch', fromPin: 2, toType: 'launch', toPin: 1 },
    ],
  },
  nodes: [
    { id: challengeId.launchButton, displayName: 'On Launch Button', type: 'launch-button', nodeClass: 'demo-launch-button', x: 330, y: 320, inPins: [], outPins: [pin('Exec', { type: 'exec' })] },
    { id: challengeId.prepare, displayName: 'Prepare Launch<TVehicle, TFuel>', type: 'prepare-launch', nodeClass: 'demo-prepare-launch', x: 650, y: 270, inPins: [pin('Exec', { type: 'exec' }), pin('Vehicle', vehicle(wc(0))), pin('Fuel', fuel(wc(1)))], outPins: [pin('Success', { type: 'exec' }), pin('Failed', { type: 'exec' }), pin('Prepared', prepared(wc(0), wc(1)))] },
    { id: challengeId.launch, displayName: 'Launch', type: 'launch', nodeClass: 'demo-launch', x: 1050, y: 170, inPins: [pin('Exec', { type: 'exec' }), pin('Prepared Rocket', prepared({ type: 'rocket' }, { type: 'rocket-fuel' }))], outPins: [] },
    { id: challengeId.error, displayName: 'Show Wrong Parts', type: 'show-wrong-parts', nodeClass: 'demo-launch-error', x: 1050, y: 430, inPins: [pin('Exec', { type: 'exec' })], outPins: [] },

    { id: challengeId.rocket, displayName: 'Moon Rocket', type: 'moon-rocket', nodeClass: 'demo-moon-rocket', x: 40, y: 40, inPins: [], outPins: [pin('Vehicle<Rocket>', vehicle({ type: 'rocket' }))] },
    { id: challengeId.car, displayName: 'Sports Car', type: 'sports-car', nodeClass: 'demo-sports-car', x: 40, y: 180, inPins: [], outPins: [pin('Vehicle<Car>', vehicle({ type: 'car' }))] },
    { id: challengeId.plane, displayName: 'Cargo Plane', type: 'cargo-plane', nodeClass: 'demo-cargo-plane', x: 40, y: 480, inPins: [], outPins: [pin('Vehicle<Plane>', vehicle({ type: 'plane' }))] },
    { id: challengeId.boat, displayName: 'Pirate Ship', type: 'pirate-ship', nodeClass: 'demo-pirate-ship', x: 40, y: 620, inPins: [], outPins: [pin('Vehicle<Boat>', vehicle({ type: 'boat' }))] },

    { id: challengeId.diesel, displayName: 'Diesel', type: 'diesel', nodeClass: 'demo-diesel', x: 330, y: 40, inPins: [], outPins: [pin('Fuel<Diesel>', fuel({ type: 'diesel' }))] },
    { id: challengeId.battery, displayName: 'Battery', type: 'battery', nodeClass: 'demo-battery', x: 330, y: 180, inPins: [], outPins: [pin('Fuel<Battery>', fuel({ type: 'battery' }))] },
    { id: challengeId.rocketFuel, displayName: 'Rocket Fuel', type: 'rocket-fuel', nodeClass: 'demo-rocket-fuel', x: 330, y: 480, inPins: [], outPins: [pin('Fuel<RocketFuel>', fuel({ type: 'rocket-fuel' }))] },
    { id: challengeId.potion, displayName: 'Magic Potion', type: 'magic-potion', nodeClass: 'demo-potion', x: 330, y: 620, inPins: [], outPins: [pin('Fuel<Potion>', fuel({ type: 'potion' }))] },
  ],
}

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

const cascadeId = {
  routes: uid(), normalize: uid(), filter: uid(), broadcast: uid(), routeMap: uid(), cache: uid(), search: uid(), logs: uid(), backup: uid(),
  latency: uid(), smooth: uid(), window: uid(), metricsMap: uid(), dashboard: uid(), alerts: uid(),
}

export const typeCascadeGraph: SampleGraph = {
  id: uid(),
  name: 'Type cascade',
  description: 'Three animated links reveal how generic types fan out through prepared pipelines',
  autoConnect: [
    { delay: 800, fromNode: cascadeId.filter, fromPin: 0, toNode: cascadeId.broadcast, toPin: 0 },
    { delay: 2800, fromNode: cascadeId.broadcast, fromPin: 0, toNode: cascadeId.routeMap, toPin: 0 },
    { delay: 5000, fromNode: cascadeId.smooth, fromPin: 0, toNode: cascadeId.window, toPin: 0 },
  ],
  nodes: [
    { id: cascadeId.routes, displayName: 'Fetch API Routes', type: 'cascade-routes', nodeClass: 'const', x: 20, y: 110, inPins: [], outPins: [pin('routes', list({ type: 'str' }))] },
    { id: cascadeId.normalize, displayName: 'Map Routes<T>', type: 'cascade-normalize', nodeClass: 'func', x: 220, y: 110, inPins: [pin('routes', list(wc(0)), [link(cascadeId.normalize, 0, cascadeId.routes, 0)])], outPins: [pin('mapped routes', list(wc(0)))] },
    { id: cascadeId.filter, displayName: 'Filter Routes<T>', type: 'cascade-filter', nodeClass: 'func', x: 500, y: 110, inPins: [pin('routes', list(wc(0)), [link(cascadeId.filter, 0, cascadeId.normalize, 0)])], outPins: [pin('visible routes', list(wc(0)))] },
    { id: cascadeId.broadcast, displayName: 'Update Router<T>', type: 'cascade-broadcast', nodeClass: 'pivot', x: 740, y: 90, inPins: [pin('routes', list(wc(0)))], outPins: [pin('active route', wc(0)), pin('all routes', list(wc(0))), pin('failed routes', list(wc(0)))] },
    { id: cascadeId.routeMap, displayName: 'Selected Route<T>', type: 'cascade-route-map', nodeClass: 'func', x: 1000, y: 20, inPins: [pin('route', wc(0))], outPins: [pin('selected route', wc(0))] },
    { id: cascadeId.cache, displayName: 'Add Recent Route<T>', type: 'cascade-cache', nodeClass: 'func', x: 1240, y: 20, inPins: [pin('route', wc(0), [link(cascadeId.cache, 0, cascadeId.routeMap, 0)])], outPins: [pin('recent routes', list(wc(0)))] },
    { id: cascadeId.search, displayName: 'Render Recent Routes', type: 'cascade-search', nodeClass: 'proc', x: 1490, y: 20, inPins: [pin('routes', list(wc(0)), [link(cascadeId.search, 0, cascadeId.cache, 0)])], outPins: [] },
    { id: cascadeId.logs, displayName: 'Log Routes', type: 'cascade-logs', nodeClass: 'proc', x: 1010, y: 180, inPins: [pin('routes', list(wc(0)), [link(cascadeId.logs, 0, cascadeId.broadcast, 1)])], outPins: [] },
    { id: cascadeId.backup, displayName: 'Retry Failed Routes', type: 'cascade-backup', nodeClass: 'proc', x: 1010, y: 310, inPins: [pin('failed routes', list(wc(0)), [link(cascadeId.backup, 0, cascadeId.broadcast, 2)])], outPins: [] },

    { id: cascadeId.latency, displayName: 'Frame Time', type: 'cascade-latency', nodeClass: 'const', x: 20, y: 520, inPins: [], outPins: [pin('milliseconds', { type: 'float' })] },
    { id: cascadeId.smooth, displayName: 'Track Frame<T>', type: 'cascade-smooth', nodeClass: 'func', x: 220, y: 520, inPins: [pin('frame time', wc(0), [link(cascadeId.smooth, 0, cascadeId.latency, 0)])], outPins: [pin('tracked frame', wc(0))] },
    { id: cascadeId.window, displayName: 'Check Performance<T>', type: 'cascade-window', nodeClass: 'pivot', x: 500, y: 500, inPins: [pin('frame time', wc(0))], outPins: [pin('frame time', wc(0)), pin('slow frame', wc(0))] },
    { id: cascadeId.metricsMap, displayName: 'Add to History<T>', type: 'cascade-metrics-map', nodeClass: 'func', x: 760, y: 470, inPins: [pin('frame time', wc(0), [link(cascadeId.metricsMap, 0, cascadeId.window, 0)])], outPins: [pin('frame history', list(wc(0)))] },
    { id: cascadeId.dashboard, displayName: 'Render Performance Chart', type: 'cascade-dashboard', nodeClass: 'proc', x: 1030, y: 470, inPins: [pin('frame history', list(wc(0)), [link(cascadeId.dashboard, 0, cascadeId.metricsMap, 0)])], outPins: [] },
    { id: cascadeId.alerts, displayName: 'Show Performance Warning', type: 'cascade-alerts', nodeClass: 'proc', x: 760, y: 640, inPins: [pin('slow frame', wc(0), [link(cascadeId.alerts, 0, cascadeId.window, 1)])], outPins: [] },
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

export const sampleGraphs: SampleGraph[] = [typeCascadeGraph, guidedGraph, conflictGraph]
