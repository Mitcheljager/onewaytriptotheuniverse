import { get } from "svelte/store"

import { onKey, onPointerMove } from "./controls"

import { player, playerVelocityInDirection } from "../stores/player"
import { scene, canvas } from "../stores/scene"
import { camera } from "../stores/camera"
import { shadowGenerator } from "../stores/shadowGenerator"

export function createPlayer() {
  // Create player box for shadows and physics
  player.set(BABYLON.Mesh.CreateCylinder("player", 1.8, 0.75, 0.75, 10, 1, get(scene)))

  get(player).layerMask = 0
  get(player).position.y = 1
  get(player).position.z = 4
  get(player).mass = 0.9
  get(player).rotation = BABYLON.Vector3.Zero()
  get(player).checkCollisions

  get(shadowGenerator).addShadowCaster(get(player))

  // Set Physics body that the camera will be attached to
  get(player).physicsImpostor = new BABYLON.PhysicsImpostor(get(player), BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0.5, restitution: 0, friction: .01 }, get(scene))
  get(player).physicsImpostor.physicsBody.linearDamping = 0.85
  get(player).physicsImpostor.physicsBody.angularDamping = 0.9999999999999999

  // Set keybinds and pointer move
  get(canvas).addEventListener("pointermove", onPointerMove)
  get(canvas).addEventListener("keydown", (event: KeyboardEvent) => onKey(event, 1))
  get(canvas).addEventListener("keyup", (event: KeyboardEvent) => onKey(event, 0))

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
  get(camera).position = get(player).position.add(new BABYLON.Vector3(0, 0.85, 0))

  // Force natural camera to only move in y and move camera with player mesh rotation
  const eulerRotation = BABYLON.Vector3.Zero()
  get(player)?.physicsImpostor?.physicsBody.quaternion.toEuler(eulerRotation)
  get(camera).rotation.y = eulerRotation.y

  get(player).rotationQuaternion.x = 0
  get(player).rotationQuaternion.z = 0
}

function translate(mesh, direction) {
  mesh.physicsImpostor.setLinearVelocity(
    mesh.physicsImpostor.getLinearVelocity().add(
      transformForce(mesh, direction.scale(.1))
    )
  )
}

function transformForce(mesh, vector) {
  const matrix = new BABYLON.Matrix()
  mesh.rotationQuaternion.toRotationMatrix(matrix)

  return BABYLON.Vector3.TransformNormal(vector, matrix)
}
