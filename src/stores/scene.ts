import { get, writable } from "svelte/store"
import Cannon from "cannon"

import { engine } from "./engine"

export let canvas = writable(null)
export let scene = writable(null)
export let gravity = writable(new BABYLON.Vector3(0, 0, 0))

export function createScene() {
  scene.set(new BABYLON.Scene(get(engine)))

  get(scene).gravity = get(gravity)
  get(scene).collisionsEnabled = true
  get(scene).enablePhysics(get(gravity), new BABYLON.CannonJSPlugin(true, 4, Cannon))
}
