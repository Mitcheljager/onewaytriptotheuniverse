import { get } from "svelte/store"
import Cannon from "cannon"

import { scene, gravity } from "../stores/scene"
import { engine } from "../stores/engine"

export function createScene() {    
  scene.set(new BABYLON.Scene(get(engine)))

  get(scene).gravity = get(gravity)
  get(scene).collisionsEnabled = true
  get(scene).enablePhysics(get(gravity), new BABYLON.CannonJSPlugin(true, 4, Cannon))
}
