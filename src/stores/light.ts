import { get, writable } from "svelte/store"

export let shadowGenerators = writable([])
export let lights = writable([])
export let meshesWithShadows = writable([])
export let staticMeshes = writable([])
export let glows = writable([])

export function createShadowGenerators() {
  shadowGenerators.set([])

  get(lights).forEach(light => {
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light)
    shadowGenerator.useContactHardeningShadow = true
    shadowGenerator.contactHardeningLightSizeUVRatio = 0.1
    shadowGenerator.transparencyShadow = true
    shadowGenerator.enableSoftTransparentShadow = true

    get(meshesWithShadows).forEach(mesh => {
      shadowGenerator.addShadowCaster(mesh)
    })

    shadowGenerators.set([...get(shadowGenerators), shadowGenerator])
  })

  get(glows).forEach(glow => {
    get(meshesWithShadows).forEach(mesh => {
      glow.addIncludedOnlyMesh(mesh)
    })
  })
}
