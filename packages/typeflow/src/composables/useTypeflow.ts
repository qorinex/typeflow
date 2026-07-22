import {
  computed,
  isRef,
  provide,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type {
  Connection,
  EdgeChange,
  NodeChange,
  NodePositionChange,
  ValidConnectionFunc,
} from '@vue-flow/core'
import {
  addLink,
  buildFlowElements,
  canConnect,
  inferWildcards,
  removeLink,
  type InferenceConflict,
  type LinkRef,
  type NodeData,
  type NodeWC,
} from '../core'
import { wildcardsKey } from './useWildcards'

export type LinkChangePayload = {
  link: LinkRef
  edgeId: string
  nodes: NodeData[]
}

export type UseTypeflowOptions = {
  nodes: MaybeRefOrGetter<NodeData[]>
  onUpdateNodes?: (nodes: NodeData[]) => void
  onLinkAdded?: (payload: LinkChangePayload) => void
  onLinkRemoved?: (payload: LinkChangePayload) => void
}

export type UseTypeflowReturn = {
  elements: Ref<any[]>
  wildcards: Ref<NodeWC>
  conflicts: Ref<InferenceConflict[]>
  nodesById: ComputedRef<Record<string, NodeData>>
  isValidConnection: ValidConnectionFunc
  onConnect: (params: Connection) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onNodesChange: (changes: NodeChange[]) => void
}

function isFlowNode(el: any): el is { id: string; position: { x: number; y: number } } {
  return !!el?.id && el.source == null && el.position != null
}

export function useTypeflow(options: UseTypeflowOptions): UseTypeflowReturn {
  const elements = ref<any[]>([])
  const wildcards = ref<NodeWC>({})
  const displayWildcards = ref<NodeWC>({})
  const conflicts = ref<InferenceConflict[]>([])

  const nodesById = computed(() =>
    Object.fromEntries(toValue(options.nodes).map((n) => [n.id, n])),
  )

  provide(wildcardsKey, {
    nodeWildcards: displayWildcards,
    validationWildcards: wildcards,
    nodesById,
    conflicts,
  })

  function readNodes() {
    return toValue(options.nodes)
  }

  function commitNodes(next: NodeData[]) {
    if (options.onUpdateNodes) options.onUpdateNodes(next)
    else if (isRef(options.nodes)) (options.nodes as Ref<NodeData[]>).value = next
    applyNodes(next)
  }

  function livePositions() {
    const map = new Map<string, { x: number; y: number }>()
    for (const el of elements.value) {
      if (!isFlowNode(el)) continue
      map.set(el.id, { x: el.position.x, y: el.position.y })
    }
    return map
  }

  // drag position can lag behind NodeData
  function withPositions(nodes: NodeData[]): NodeData[] {
    const pos = livePositions()
    if (!pos.size) return nodes
    let changed = false
    const next = nodes.map((n) => {
      const p = pos.get(n.id)
      if (!p || (p.x === n.x && p.y === n.y)) return n
      changed = true
      return { ...n, x: p.x, y: p.y }
    })
    return changed ? next : nodes
  }

  function recomputeWildcards(nodes: NodeData[] = readNodes()) {
    const edges = elements.value.filter((e) => e.source && e.target && e.sourceHandle)
    const result = inferWildcards(edges, nodes)
    wildcards.value = result.bindings
    displayWildcards.value = result.displayBindings
    conflicts.value = result.conflicts
  }

  function applyNodes(nodes: NodeData[]) {
    const previousNodes = new Map(
      elements.value
        .filter(isFlowNode)
        .map((element) => [element.id, element]),
    )
    elements.value = buildFlowElements(nodes).map((element: any) => {
      if (!isFlowNode(element)) return element
      const previous = previousNodes.get(element.id) as any
      if (!previous) return element
      return {
        ...element,
        position: previous.position,
        dimensions: previous.dimensions,
        selected: previous.selected,
      }
    })
    recomputeWildcards(nodes)
  }

  watch(
    () => toValue(options.nodes),
    (nodes) => applyNodes(nodes),
    { immediate: true, deep: true },
  )

  const isValidConnection: ValidConnectionFunc = (params) => {
    if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) {
      return false
    }
    return canConnect(
      {
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      },
      nodesById.value,
      wildcards.value,
    )
  }

  function onConnect(params: Connection) {
    if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) {
      return
    }

    const nodes = withPositions(readNodes())
    const result = addLink(
      nodes,
      {
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      },
      wildcards.value,
    )
    if (!result) return

    options.onLinkAdded?.({
      link: result.link,
      edgeId: result.edgeId,
      nodes: result.nodes,
    })
    commitNodes(result.nodes)
  }

  function onEdgesChange(changes: EdgeChange[]) {
    let nodes = withPositions(readNodes())
    let mutated = false

    for (const change of changes) {
      if (change.type !== 'remove') continue
      const result = removeLink(nodes, change.id)
      if (!result) continue
      nodes = result.nodes
      mutated = true
      options.onLinkRemoved?.({
        link: result.link,
        edgeId: result.edgeId,
        nodes: result.nodes,
      })
    }

    if (mutated) {
      commitNodes(nodes)
      return
    }

    queueMicrotask(() => recomputeWildcards())
  }

  function onNodesChange(changes: NodeChange[]) {
    const ended = changes.filter(
      (c): c is NodePositionChange =>
        c.type === 'position' && !!c.position && c.dragging === false,
    )

    if (ended.length) {
      let mutated = false
      const next = readNodes().map((n) => {
        const change = ended.find((c) => c.id === n.id)
        if (!change?.position) return n
        if (n.x === change.position.x && n.y === change.position.y) return n
        mutated = true
        return { ...n, x: change.position.x, y: change.position.y }
      })
      if (mutated) {
        // don't rebuild elements here - parent watch will
        if (options.onUpdateNodes) options.onUpdateNodes(next)
        else if (isRef(options.nodes)) (options.nodes as Ref<NodeData[]>).value = next
        else applyNodes(next)
      }
    }

    queueMicrotask(() => recomputeWildcards())
  }

  return {
    elements,
    wildcards,
    conflicts,
    nodesById,
    isValidConnection,
    onConnect,
    onEdgesChange,
    onNodesChange,
  }
}
