import { writable, get } from "svelte/store"

import { scene } from "./scene"

export let engine = writable(null)

export function createPipeline() {
  const pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", false, get(scene))

  pipeline.bloomEnabled = true
  pipeline.bloomThreshold = 0.95
  pipeline.bloomWeight = 0.75
  pipeline.bloomKernel = 128
  pipeline.bloomScale = 0.5
}

export function runRenderLoop() {
  get(engine).runRenderLoop(() => get(scene).render())

  createPipeline()
}
