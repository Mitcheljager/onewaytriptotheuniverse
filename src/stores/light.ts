import { get, writable } from "svelte/store"

export let shadowGenerators = writable([])
export let lightsCastingShadows = writable([])
export let meshesWithShadows = writable([])
export let staticMeshes = writable([])
export let glows = writable([])

export function createShadowGenerators() {
  shadowGenerators.set([])

  get(lightsCastingShadows).forEach(light => {
    const shadowGenerator = createShadowGenerator(light)
    
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

function createShadowGenerator(light) {
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, light)
  shadowGenerator.useContactHardeningShadow = true
  shadowGenerator.contactHardeningLightSizeUVRatio = 0.1
  shadowGenerator.frustumEdgeFalloff = 1.0

  return shadowGenerator
}
