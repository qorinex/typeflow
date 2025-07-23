import { inject, type InjectionKey, type Ref } from 'vue'
import type { InferenceConflict, NodeWC, PlanNodeData } from '../core'

export type WildcardsContext = {
  nodeWildcards: Ref<NodeWC>
  nodesById: Ref<Record<string, PlanNodeData>>
  conflicts: Ref<InferenceConflict[]>
}

export const wildcardsKey: InjectionKey<WildcardsContext> = Symbol('plan-wildcards')

export function useWildcards(): WildcardsContext {
  const ctx = inject(wildcardsKey)
  if (!ctx) {
    throw new Error('useWildcards() must be used inside PlanCanvas provider')
  }
  return ctx
}
