import { computed, inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { createTypeRegistry } from './createTypeRegistry'
import type { TypeRegistry } from './types'

export const typeRegistryKey: InjectionKey<ComputedRef<TypeRegistry>> = Symbol(
  'typeflow-type-registry',
)

const emptyRegistry = createTypeRegistry({ packs: [] })

export function provideTypeRegistry(
  registry: Ref<TypeRegistry> | ComputedRef<TypeRegistry> | TypeRegistry,
) {
  const resolved = computed(() => {
    if (typeof registry === 'object' && registry !== null && 'value' in registry) {
      return (registry as Ref<TypeRegistry>).value
    }
    return registry as TypeRegistry
  })
  provide(typeRegistryKey, resolved)
  return resolved
}

export function useTypeRegistry() {
  const typeRegistry = inject(typeRegistryKey, computed(() => emptyRegistry))
  return { typeRegistry }
}
