export { createBlueprintTheme, type BlueprintNodeClass } from './theme'
export { blueprintTypePack, bp, type BlueprintPinIconKind } from './pack'
export { default as BlueprintPinHandle } from './BlueprintPinHandle.vue'
export { default as BlueprintPinIcon } from './pinIcons/PinIcon.vue'

import { provide, type App } from 'vue'
import { provideFlowTheme } from '../../theme'
import { createTypeRegistry, provideTypeRegistry, type TypeRegistry } from '../../typeRegistry'
import { pinHandleKey } from '../../vue/pinHandleKey'
import BlueprintPinHandle from './BlueprintPinHandle.vue'
import { createBlueprintTheme } from './theme'
import { blueprintTypePack } from './pack'

export function createBlueprintTypeRegistry(): TypeRegistry {
  return createTypeRegistry({ packs: [blueprintTypePack] })
}

/**
 * Provides Blueprint theme, type registry and pin handle
 */
export function provideBlueprintPreset() {
  const theme = createBlueprintTheme()
  const typeRegistry = createBlueprintTypeRegistry()
  provideFlowTheme(theme)
  provideTypeRegistry(typeRegistry)
  provide(pinHandleKey, BlueprintPinHandle)
  return { theme, typeRegistry }
}

export function provideBlueprintPinHandle() {
  provide(pinHandleKey, BlueprintPinHandle)
}

export function installBlueprintPinHandle(app: App) {
  app.provide(pinHandleKey, BlueprintPinHandle)
}
