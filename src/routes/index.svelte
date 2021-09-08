<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import * as BABYLON from "babylonjs"

  import { lockPointer, setStandardCamera } from "$lib/camera"
  import { createPlayer } from "$lib/player"
  import { createBox, createWindow, createPlane } from "$lib/meshes"
  import { createStandardSkybox } from "$lib/skybox"

  import { canvas, scene, createScene } from "../stores/scene"
  import { engine,  runRenderLoop, fps } from "../stores/engine"
  import { lightsCastingShadows, createShadowGenerators, meshesWithShadows, staticMeshes, glows } from "../stores/light"

  onMount(() => {
    $engine = new BABYLON.Engine($canvas, true)

    createScene()
    setUpScene()

    setStandardCamera()
    createPlayer()

    createShadowGenerators()

    runRenderLoop()
  })

  onDestroy(() => {
    $lightsCastingShadows = []
    $meshesWithShadows = []
    $staticMeshes = []
    $glows = []

    if ($scene) { $scene.dispose() }
    if ($engine) { $engine.dispose() }
  })

  async function setUpScene() {
    createStandardSkybox()

    const lamp = BABYLON.Mesh.CreateCylinder("lamp", 2, 0.1, 0.1, 12, 0, $scene)
    lamp.position = new BABYLON.Vector3(1.9, 3.9, 0)
    lamp.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0)
    lamp.material = new BABYLON.StandardMaterial("lightGlow", $scene)
    lamp.material.emissiveColor = new BABYLON.Color3(1, 1, 1)

    // Physics object
    createBox("box", new BABYLON.Vector3(1, 1, 1), new BABYLON.Vector3(0, .75, 0), "box.gif", "", { textureScale: 1, rotation: new BABYLON.Vector3(0, .75, 0), mass: 0.999 })
    
    // Scene
    createWindow("window", new BABYLON.Vector3(0.1, 4, 12), new BABYLON.Vector3(-2, 2, 0))

    createPlane("backWall", new BABYLON.Vector2(4, 4), new BABYLON.Vector3(0, 2, -6), new BABYLON.Vector3(0, 0, 0), "wall_2.gif", "wall_2_normal.gif", { textureAxis: ["y", "x"] })
    createPlane("wall", new BABYLON.Vector2(4, 12), new BABYLON.Vector3(2, 2, 0), new BABYLON.Vector3(0, Math.PI / 2, Math.PI / 2), "wall_2.gif", "wall_2_normal.gif")
    createPlane("ceiling", new BABYLON.Vector2(4, 12), new BABYLON.Vector3(0, 4, 0), new BABYLON.Vector3(Math.PI / 2, 0, 0), "ceiling_2.gif", "ceiling_2_normal.gif")
    createPlane("floor", new BABYLON.Vector2(4, 12), new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(Math.PI / 2, 0, 0), "wall_2.gif", "wall_2_normal.gif")

    const point = new BABYLON.PointLight("point", new BABYLON.Vector3(0, 3, 4), $scene)
    point.intensity = 0.25
    point.diffuse = new BABYLON.Color3(1, 0.9, 0.75)
    point.specular = new BABYLON.Color3(1, 0.9, 0.75)

    const point2 = new BABYLON.PointLight("point2", new BABYLON.Vector3(0, 3, -4), $scene)
    point2.intensity = 0.25
    point2.diffuse = new BABYLON.Color3(1, 0.9, 0.75)
    point2.specular = new BABYLON.Color3(1, 0.9, 0.75)

    const point3 = new BABYLON.PointLight("point3", new BABYLON.Vector3(0, 3, -3.5), $scene)
    point3.intensity = 0.2
    point3.range = 5
    point3.diffuse = new BABYLON.Color3(0, 1, 1)
    point3.specular = new BABYLON.Color3(0, 1, 1)
    point3.includedOnlyMeshes = $staticMeshes
  }
</script>



<svelte:window on:resize={ () => { if ($engine) $engine.resize() } } />



<div class="fps">{ $fps } </div>

<main on:click={ lockPointer }>
  <canvas bind:this={ $canvas } />
</main>



<style>
  :global(body) {
    background: black;
    color: white;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }

  main {
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
  }

  canvas {
    width: 100%;
    height: 100%;
  }

  .fps {
    position: fixed;
    top: 1rem;
    left: 1rem;
    font-size: 1.25rem;
    font-family: "Consolas", monospace;
    font-weight: bold;
    text-shadow: 0 1px 2px black;
  }
</style>
