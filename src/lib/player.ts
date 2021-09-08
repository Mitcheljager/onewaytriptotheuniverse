import { get } from "svelte/store"

import { onKey, onPointerMove } from "./controls"

import { player, playerVelocityInDirection, playerLight } from "../stores/player"
import { scene, canvas } from "../stores/scene"
import { camera } from "../stores/camera"
import { lightsCastingShadows } from "../stores/light"

let isPlayerLightKeyDown = false

export function createPlayer() {
  // Create player box for shadows and physics
  player.set(BABYLON.Mesh.CreateCapsule("player", { height: 1.8, radius: 0.35, tessellation: 24, subdivisions: 1, capSubdivisions: 12 } , get(scene)))

  get(player).layerMask = 0
  get(player).position.y = 1
  get(player).position.z = 4
  get(player).mass = 0.9
  get(player).rotation = new BABYLON.Vector3(0, -3.125, 0)
  get(player).checkCollisions

  // meshesWithShadows.set([...get(meshesWithShadows), get(player)])

  // Set Physics body that the camera will be attached to
  get(player).physicsImpostor = new BABYLON.PhysicsImpostor(get(player), BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0.5, restitution: 0, friction: .01 }, get(scene))
  get(player).physicsImpostor.physicsBody.linearDamping = 0.85
  get(player).physicsImpostor.physicsBody.angularDamping = 0.9999999999999999

  // Set keybinds and pointer move
  get(canvas).addEventListener("pointermove", onPointerMove)
  get(canvas).addEventListener("keydown", (event: KeyboardEvent) => onKey(event, 1))
  get(canvas).addEventListener("keyup", (event: KeyboardEvent) => onKey(event, 0))

  get(scene).onDispose = removePlayerEventListeners

  createPlayerLight()

  get(scene).registerBeforeRender(update)
}

async function update() {
  if (get(playerVelocityInDirection).forward) translate(get(player), new BABYLON.Vector3(0, 0, 1))
  if (get(playerVelocityInDirection).right) translate(get(player), new BABYLON.Vector3(1, 0, 0))
  if (get(playerVelocityInDirection).backward) translate(get(player), new BABYLON.Vector3(0, 0, -1))
  if (get(playerVelocityInDirection).left) translate(get(player), new BABYLON.Vector3(-1, 0, 0))
  if (get(playerVelocityInDirection).up) translate(get(player), new BABYLON.Vector3(0, 1, 0))
  if (get(playerVelocityInDirection).down) translate(get(player), new BABYLON.Vector3(0, -1, 0))

  if (!get(camera)) return

  // player.rotation.y = camera.rotation
  get(camera).position = get(player).position.add(new BABYLON.Vector3(0, 0.75, 0))

  // Force natural camera to only move in y and move camera with player mesh rotation
  const eulerRotation = BABYLON.Vector3.Zero()
  get(player)?.physicsImpostor?.physicsBody.quaternion.toEuler(eulerRotation)
  get(camera).rotation.y = eulerRotation.y

  get(player).rotationQuaternion.x = 0
  get(player).rotationQuaternion.z = 0

  if (!get(playerLight)) return

  get(playerLight).position = get(player).position.add(new BABYLON.Vector3(0, 1, 0))
  get(playerLight).setDirectionToTarget(get(camera).getFrontPosition(1))
}

function translate(mesh, direction, speed = .05) {
  mesh.physicsImpostor.setLinearVelocity(
    mesh.physicsImpostor.getLinearVelocity().add(
      transformForce(mesh, direction.scale(speed))
    )
  )
}

function transformForce(mesh, vector) {
  const matrix = new BABYLON.Matrix()
  mesh.rotationQuaternion.toRotationMatrix(matrix)

  return BABYLON.Vector3.TransformNormal(vector, matrix)
}

export function removePlayerEventListeners() {
  if (!get(canvas)) return

  get(canvas).removeEventListener("pointermove", onPointerMove)
  get(canvas).removeEventListener("keydown", (event: KeyboardEvent) => onKey(event, 1))
  get(canvas).removeEventListener("keyup", (event: KeyboardEvent) => onKey(event, 0))
}

function createPlayerLight() {
  playerLight.set(new BABYLON.SpotLight("playerLight", get(player).position, new BABYLON.Vector3(0, 0, 1), Math.PI, 50, get(scene)))
  get(playerLight).diffuse = new BABYLON.Color3(1, 0.9, 0.75)
  get(playerLight).specular = new BABYLON.Color3(1, 0.9, 0.75)
  get(playerLight).intensity = 1
  get(playerLight).range = 20
  get(playerLight).setEnabled(false)

  get(playerLight).excludeMeshes = [get(player)]

  lightsCastingShadows.set([...get(lightsCastingShadows), get(playerLight)])

  get(canvas).addEventListener("keydown", togglePlayerLight)
  get(canvas).addEventListener("keyup", () => { isPlayerLightKeyDown = false })
  
}

function togglePlayerLight() {
  if (isPlayerLightKeyDown) return

  isPlayerLightKeyDown = true

  if (event.key == "f") get(playerLight).setEnabled(!get(playerLight).isEnabled())
}
