import { inject, type InjectionKey, type Ref } from 'vue'
import type { InferenceConflict, NodeData, NodeWC } from '../core'

export type WildcardsContext = {
  nodeWildcards: Ref<NodeWC>
  validationWildcards: Ref<NodeWC>
  nodesById: Ref<Record<string, NodeData>>
  conflicts: Ref<InferenceConflict[]>
}

export const wildcardsKey: InjectionKey<WildcardsContext> = Symbol('flow-wildcards')

export function useWildcards() {
  const ctx = inject(wildcardsKey)
  if (!ctx) throw new Error('useWildcards() needs useTypeflow() above')
  return ctx
}
