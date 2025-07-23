import { computed, inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { createTheme, getNodeAppearance, getPinColor, getPinLabel } from './createTheme'
import { defaultTheme } from './defaults'
import type { PlanTheme, PlanThemeOverride } from './types'
import type { NodeClass } from '../core'

export const planThemeKey: InjectionKey<ComputedRef<PlanTheme>> = Symbol('plan-theme')

export function providePlanTheme(theme: Ref<PlanTheme> | ComputedRef<PlanTheme> | PlanTheme) {
  const resolved = computed(() => {
    if (typeof theme === 'object' && theme !== null && 'value' in theme) {
      return (theme as Ref<PlanTheme>).value
    }
    return theme as PlanTheme
  })
  provide(planThemeKey, resolved)
  return resolved
}

export function usePlanTheme() {
  const theme = inject(planThemeKey, computed(() => defaultTheme))

  return {
    theme,
    pinColor: (type: string) => getPinColor(theme.value, type),
    pinLabel: (type: string) => getPinLabel(theme.value, type),
    nodeStyle: (nodeClass?: NodeClass | string) => getNodeAppearance(theme.value, nodeClass),
  }
}

export { createTheme, defaultTheme }
export type { PlanTheme, PlanThemeOverride }
