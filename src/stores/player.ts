import { writable } from "svelte/store"

export let player = writable(null)

export let playerVelocityInDirection = writable({
  forward: 0,
  right: 0,
  backward: 0,
  left: 0,
  up: 0,
  down: 0
})
