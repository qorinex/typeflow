import { computed, inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { defaultTheme } from './defaults'
import { getNodeAppearance, getPinColor, getPinLabel } from './createTheme'
import type { FlowTheme } from './types'

export const flowThemeKey: InjectionKey<ComputedRef<FlowTheme>> = Symbol('flow-theme')

export function provideFlowTheme(theme: Ref<FlowTheme> | ComputedRef<FlowTheme> | FlowTheme) {
  const resolved = computed(() => {
    if (typeof theme === 'object' && theme !== null && 'value' in theme) {
      return (theme as Ref<FlowTheme>).value
    }
    return theme as FlowTheme
  })
  provide(flowThemeKey, resolved)
  return resolved
}

export function useFlowTheme() {
  const theme = inject(flowThemeKey, computed(() => defaultTheme))

  return {
    theme,
    pinColor: (type: string) => getPinColor(theme.value, type),
    pinLabel: (type: string) => getPinLabel(theme.value, type),
    nodeStyle: (nodeClass?: string) => getNodeAppearance(theme.value, nodeClass),
  }
}

export type { FlowTheme, FlowThemeOverride } from './types'
