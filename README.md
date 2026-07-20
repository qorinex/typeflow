# Typeflow

Typeflow is a typed node-graph engine with ready-to-use components for
[Vue Flow](https://vueflow.dev/). It validates connections between pins and
infers wildcard types across the graph.

## Features

- Typed input and output pins
- Type variables shared between pins with `typeVar()`
- Type inference across connected nodes
- Nested types such as lists, maps, tuples, and structs
- Validation before a connection is created
- Conflict reporting for incompatible types
- Vue Flow components for nodes, pins, and edges
- Framework-independent inference core
- Custom themes and type registries
- Optional Blueprint-style preset

## Installation

```sh
npm install @qorinex/typeflow vue @vue-flow/core @vue-flow/background
```

Import the library styles once in your application entry:

```ts
import '@qorinex/typeflow/style.css'
```

## Quick start

```vue
<template>
  <VueFlow
    v-model="elements"
    fit-view-on-init
    :is-valid-connection="isValidConnection"
    @connect="onConnect"
    @edges-change="onEdgesChange"
    @nodes-change="onNodesChange"
  >
    <Background />

    <template #node-flow="props">
      <FlowNode v-bind="props" />
    </template>

    <template #edge-typed="props">
      <EdgeItem v-bind="props" />
    </template>
  </VueFlow>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Background } from '@vue-flow/background'
import { VueFlow } from '@vue-flow/core'
import {
  EdgeItem,
  FlowNode,
  createTheme,
  provideFlowTheme,
  useTypeflow,
  type NodeData,
  typeScheme,
  typeVar,
} from '@qorinex/typeflow'

const pin = (name: string, valueSchema: NodeData['inPins'][number]['valueSchema']) => ({
  name,
  valueSchema,
  links: [],
})

const nodes = ref<NodeData[]>([
  {
    id: 'text',
    displayName: 'Text',
    type: 'source',
    x: 80,
    y: 120,
    inPins: [],
    outPins: [pin('text', typeScheme('str'))],
  },
  {
    id: 'print',
    displayName: 'Print',
    type: 'sink',
    x: 360,
    y: 120,
    inPins: [pin('value', typeVar(0))],
    outPins: [],
  },
])

provideFlowTheme(createTheme())

const {
  elements,
  isValidConnection,
  onConnect,
  onEdgesChange,
  onNodesChange,
} = useTypeflow({ nodes })
</script>
```

Connect `text` to `value`: `typeVar(0)` resolves to `str`.

## Blueprint preset

The optional Blueprint preset provides a theme, type registry, pin renderer and
constructors for common nested types:

```ts
import { typeVar } from '@qorinex/typeflow/core'
import {
  bp,
  provideBlueprintPreset,
} from '@qorinex/typeflow/presets/blueprint'

provideBlueprintPreset()

const listOfStrings = bp.list(bp.t('str'))
const listOfAnything = bp.list(typeVar(0))
```

## Development

```sh
npm install
npm run dev
```

Useful commands:

```sh
npm test          # run unit tests
npm run build:lib # build the npm package
npm run build     # type-check and build the demo
```

The package is built into `packages/typeflow/dist`.

## License

[MIT](packages/typeflow/LICENSE) © 2026 qorinex
