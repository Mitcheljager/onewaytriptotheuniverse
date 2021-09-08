import { writable } from "svelte/store"

export const player = writable(null)
export const playerLight = writable(null)

export const playerVelocityInDirection = writable({
  forward: 0,
  right: 0,
  backward: 0,
  left: 0,
  up: 0,
  down: 0
})
