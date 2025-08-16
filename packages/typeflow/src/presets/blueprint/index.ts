export { createBlueprintTheme, type BlueprintNodeClass } from './theme'
export { default as BlueprintPinHandle } from './BlueprintPinHandle.vue'
export { default as BlueprintPinIcon } from './pinIcons/PinIcon.vue'

import { provide, type App } from 'vue'
import type { FlowTheme } from '../../theme'
import { pinHandleKey } from '../../vue/pinHandleKey'
import BlueprintPinHandle from './BlueprintPinHandle.vue'
import { createBlueprintTheme } from './theme'

export function installBlueprintPreset(): { theme: FlowTheme } {
  return { theme: createBlueprintTheme() }
}

export function provideBlueprintPinHandle() {
  provide(pinHandleKey, BlueprintPinHandle)
}

export function installBlueprintPinHandle(app: App) {
  app.provide(pinHandleKey, BlueprintPinHandle)
}
