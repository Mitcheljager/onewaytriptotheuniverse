import { writable } from "svelte/store"

export let canvas = writable(null)
export let scene = writable(null)
export let gravity = writable(new BABYLON.Vector3(0, 0, 0))
