import { get } from "svelte/store"

import { player, playerVelocityInDirection } from "../stores/player"

export function onPointerMove(event) {
  rotate(get(player), new BABYLON.Vector3(0, event.movementX, 0), 0.015)
}

export function onKey(event: KeyboardEvent, force: number) {
  if (event.key == "w") get(playerVelocityInDirection).forward = force
  if (event.key == "d") get(playerVelocityInDirection).right = force
  if (event.key == "s") get(playerVelocityInDirection).backward = force
  if (event.key == "a") get(playerVelocityInDirection).left = force
  if (event.key == " ") get(playerVelocityInDirection).up = force
  if (event.key == "c") get(playerVelocityInDirection).down = force
}

function rotate(mesh, direction, power) {
  mesh.physicsImpostor.setAngularVelocity(
    mesh.physicsImpostor.getAngularVelocity().add(
      direction.scale(power)
    )
  )
}
