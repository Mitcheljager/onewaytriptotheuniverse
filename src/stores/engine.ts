import { writable, get } from "svelte/store"

import { scene } from "./scene"

export let engine = writable(null)
export let fps = writable(0)

export function runRenderLoop() {
  // Set max lights per material
  get(scene).materials.forEach(function(mtl) { mtl.maxSimultaneousLights = 20 })

  // Rune render loop, this is fired for every frame rendered
  get(engine).runRenderLoop(() => get(scene).render())

  // FPS Counter
  fps.set(get(engine).getFps().toFixed())

  createPipeline()
}

export function createPipeline() {
  const pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", false, get(scene))

  pipeline.bloomEnabled = true
  pipeline.bloomThreshold = 0.95
  pipeline.bloomWeight = 0.25
  pipeline.bloomKernel = 128
  pipeline.bloomScale = 0.25
}
