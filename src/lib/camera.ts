import { get } from "svelte/store"

import { scene, canvas } from "../stores/scene"
import { camera } from "../stores/camera"

export function setStandardCamera() {
  camera.set(new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 5, 3), get(scene)))

  // Attach camera to the scene
  get(camera).setTarget(BABYLON.Vector3.Zero())
  get(camera).attachControl(get(canvas), true)

  // Set collision box for camera
  get(camera).ellipsoid = new BABYLON.Vector3(1, 1, 1)
  get(camera).checkCollisions = true
  get(camera).applyGravity = true

  get(camera).rotation = new BABYLON.Vector3(0, 0, 0)

  get(camera).minZ = 0

  // Set "movement" speed
  get(camera).speed = 0.75

  // Set fov
  get(camera).fov = 1.2

  // Set sensitity and smoothing
  get(camera).angularSensibility = 7500
  get(camera).inertia = 0.6

  get(camera).position.y = 3
}

export function lockPointer() {
  get(canvas).requestPointerLock = get(canvas).requestPointerLock || get(canvas).mozRequestPointerLock
  get(canvas).requestPointerLock()
}
