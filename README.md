<h1 align="center">Typeflow</h1>

<p align="center">
  <strong>Typeflow is a typed node-graph toolkit for Vue applications, built with TypeScript and Vue Flow.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@qorinex/typeflow">
    <img src="https://img.shields.io/npm/v/%40qorinex%2Ftypeflow?style=flat-square" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@qorinex/typeflow">
    <img src="https://img.shields.io/npm/dm/%40qorinex%2Ftypeflow?style=flat-square" alt="npm downloads" />
  </a>
  <a href="packages/typeflow/LICENSE">
    <img src="https://img.shields.io/npm/l/%40qorinex%2Ftypeflow?style=flat-square" alt="MIT license" />
  </a>
  <a href="https://vuejs.org/">
    <img src="https://img.shields.io/badge/Vue-3.2%2B-42b883?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue 3.2+" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-ready-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript ready" />
  </a>
</p>

<p align="center">
  <a href="https://q-typeflow.netlify.app/"><strong>Live demo</strong></a>
  ·
  <a href="#installation"><strong>Installation</strong></a>
  ·
  <a href="#quick-start"><strong>Quick start</strong></a>
  ·
  <a href="#blueprint-preset"><strong>Blueprint preset</strong></a>
</p>

<br />

<p align="center">
  <a href="https://q-typeflow.netlify.app/">
    <img
      width="1672"
      height="941"
      alt="Typeflow — type-safe node graphs with wildcard inference for Vue Flow"
      src="https://github.com/user-attachments/assets/4de6c743-7833-4556-9afa-0f630314e814"
    />
  </a>
</p>

---

## What Typeflow provides

Typeflow adds a reusable type system to node-based Vue applications.

Define a type scheme for each input and output pin, and Typeflow infers generic
types, validates connections, propagates resolved types through the graph, and
reports incompatible constraints.

The library is built on [Vue Flow](https://vueflow.dev/), which provides the
canvas and graph interactions, while Typeflow provides the type-aware behavior:

- Typed input and output pins
- Generic type variables with `typeVar()`
- Type inference across connected nodes
- Nested lists, maps, tuples, and structs
- Validation before a connection is created
- Conflict reporting for incompatible constraints
- Ready-to-use Vue components and customizable themes

When a generic pin is connected to a concrete type, Typeflow resolves and
propagates that type through the graph. Nested schemes are validated
recursively, so compatibility is checked beyond the top-level type name.

```text
string ─────▶ T ─────▶ T
              └── resolved as string

list[string] ─────▶ list[T]       ✓
list[string] ─────▶ list[number]  ✕
```

---

## Installation

```sh
npm install @qorinex/typeflow vue @vue-flow/core @vue-flow/background
```

Import the library styles once in your application entry:

```ts
import '@qorinex/typeflow/style.css'
```

---

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

type PinSchema = NodeData['inPins'][number]['valueSchema']

const pin = (name: string, valueSchema: PinSchema) => ({
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
    outPins: [
      pin('text', typeScheme('str')),
    ],
  },
  {
    id: 'print',
    displayName: 'Print',
    type: 'sink',
    x: 360,
    y: 120,
    inPins: [
      pin('value', typeVar(0)),
    ],
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

Connect `Text.text` to `Print.value`.

Because the `value` pin uses `typeVar(0)`, Typeflow resolves it to `str`.

---

## Wildcard inference

A type variable represents a type that is not known yet:

```ts
import { typeVar } from '@qorinex/typeflow/core'

const T = typeVar(0)
```

Pins that use the same type-variable index share one inferred type inside a node.

```text
┌─────────────────────┐
│ Pass                │
│                     │
│ T  ────────────── T │
└─────────────────────┘
```

After connecting a string:

```text
string ─▶ Pass<string> ─▶ string
```

Typeflow propagates the binding across connected nodes and reports conflicts when the same variable receives incompatible constraints.

---

## Nested types

Named types can contain other type schemes:

```ts
import {
  typeScheme,
  typeVar,
} from '@qorinex/typeflow/core'

const stringList = typeScheme('list', {
  item: typeScheme('str'),
})

const genericList = typeScheme('list', {
  item: typeVar(0),
})

const user = typeScheme('struct', {
  id: typeScheme('int'),
  name: typeScheme('str'),
  tags: typeScheme('list', {
    item: typeScheme('str'),
  }),
})
```

This allows Typeflow to validate complete structures instead of comparing only top-level type names.

```text
list[string] ─▶ list[T]       ✓ T becomes string

list[string] ─▶ list[number]  ✕ incompatible item type
```

Supported compositions include:

```text
list[string]

map[struct{id: int, name: string}]

tuple[int, string, bool]

struct{
  id: int,
  name: string,
  tags: list[string]
}
```

---

## Blueprint preset

Enable the optional Blueprint-inspired theme and type registry:

```ts
import { typeVar } from '@qorinex/typeflow/core'
import {
  bp,
  provideBlueprintPreset,
} from '@qorinex/typeflow/presets/blueprint'

provideBlueprintPreset()

const stringList = bp.list(
  bp.t('str'),
)

const genericList = bp.list(
  typeVar(0),
)

const user = bp.struct({
  id: bp.t('int'),
  name: bp.t('str'),
  tags: bp.list(bp.t('str')),
})

const result = bp.tuple(
  user,
  bp.t('bool'),
)
```

The preset includes common Blueprint-style types:

| Category | Types |
|---|---|
| Flow | `exec` |
| Primitive | `any`, `bool`, `int`, `float`, `str` |
| Time | `time`, `duration` |
| Container | `list`, `map`, `tuple`, `struct` |

Every registered type can define its own label, color, icon, formatter, and nested arguments.

---

## Headless core

The inference core is independent from Vue rendering.

Use it with the included Vue Flow components or build a custom interface on top of the core package.

```ts
import {
  canConnect,
  inferWildcards,
  typeScheme,
  typeVar,
} from '@qorinex/typeflow/core'
```

This separation makes the type system easier to test and keeps rendering concerns out of inference logic.

---

## Package entry points

Import only the layer you need:

| Entry point | Purpose |
|---|---|
| `@qorinex/typeflow` | Main public API |
| `@qorinex/typeflow/core` | Framework-independent graph and inference core |
| `@qorinex/typeflow/vue` | Vue-specific components and composables |
| `@qorinex/typeflow/theme` | Theme utilities |
| `@qorinex/typeflow/typeRegistry` | Custom type registries |
| `@qorinex/typeflow/presets/blueprint` | Blueprint-inspired preset |
| `@qorinex/typeflow/style.css` | Library styles |

---

## Compatibility

| Dependency | Supported version |
|---|---|
| Vue | `^3.2.45` |
| Vue Flow Core | `^1.33.1` |
| Vue Flow Background | `^1.2.0` |

Typeflow is distributed as an ESM package with TypeScript declarations.

---

## Use cases

- Visual programming editors
- Workflow and automation builders
- Data transformation pipelines
- AI and agent workflow editors
- Game logic tools
- Shader-like graph interfaces
- Form and configuration builders
- Internal low-code platforms

---

## Development

Clone the repository and install dependencies:

```sh
git clone https://github.com/qorinex/typeflow.git
cd typeflow
npm install
```

Start the demo:

```sh
npm run dev
```

Run the test suite:

```sh
npm test
```

Build the library:

```sh
npm run build:lib
```

Type-check and build the demo:

```sh
npm run build
```

The package output is written to:

```text
packages/typeflow/dist
```

---

## Contributing

Bug reports, ideas, examples, documentation improvements, and pull requests are welcome.

For type-inference issues, a useful report should include:

1. The node and pin schemas
2. The connections between nodes
3. The inferred result
4. The expected result

Built something with Typeflow? Share it in an issue so it can be considered for a future project showcase.

---

## License

[MIT](packages/typeflow/LICENSE) © 2026 qorinex