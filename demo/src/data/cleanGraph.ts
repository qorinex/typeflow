import type { NodeData, Pin, PinLink, PinTypeScheme } from '@qorinex/typeflow/core'
import { typeVar } from '@qorinex/typeflow/core'

function pin(name: string, schema: PinTypeScheme, links: PinLink[] = []): Pin {
  return { name, linkable: true, valueSchema: schema, links }
}

function link(inNode: string, inIdx: number, outNode: string, outIdx: number): PinLink {
  return { inNode, inIdx, outNode, outIdx }
}

const uid = () => crypto.randomUUID()

const id = {
  source: uid(),
  pass: uid(),
  sink: uid(),
}

export const cleanGraphNodes: NodeData[] = [
  {
    id: id.source,
    displayName: 'Source',
    type: 'source',
    x: 80,
    y: 160,
    inPins: [],
    outPins: [
      pin('count', { type: 'int' }),
      pin('label', typeVar(0)),
    ],
  },
  {
    id: id.pass,
    displayName: 'Pass',
    type: 'pass',
    x: 340,
    y: 160,
    inPins: [
      pin('count', { type: 'int' }, [link(id.pass, 0, id.source, 0)]),
      pin('label', typeVar(0), [link(id.pass, 1, id.source, 1)]),
    ],
    outPins: [
      pin('count', { type: 'int' }),
      pin('label', typeVar(0)),
    ],
  },
  {
    id: id.sink,
    displayName: 'Consume',
    type: 'sink',
    x: 600,
    y: 160,
    inPins: [
      pin('count', { type: 'int' }, [link(id.sink, 0, id.pass, 0)]),
      pin('label', { type: 'str' }, [link(id.sink, 1, id.pass, 1)]),
    ],
    outPins: [],
  },
]
