<script lang="ts">
  import { onMount } from "svelte"
  import * as BABYLON from "babylonjs"

  import { lockPointer, setStandardCamera } from "../lib/camera"
  import { createPlayer } from "../lib/player"
  import { createScene } from "../lib/scene"

  import { canvas, scene, gravity } from "../stores/scene"
  import { engine } from "../stores/engine"
  import { shadowGenerator } from "../stores/shadowGenerator"

  onMount(() => {
    $engine = new BABYLON.Engine($canvas, true)

    createScene()
    setUpScene()

    setStandardCamera()
    createPlayer()

    $engine.runRenderLoop(() => $scene.render())
  })

  function setUpScene() {
    const light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-30, 30, -10), $scene)
    light.intensity = 0.85

    const ambienceLight = new BABYLON.HemisphericLight("ambience", new BABYLON.Vector3(0, 30, 0), $scene)
    ambienceLight.intensity = 0.1
    
    const box = BABYLON.Mesh.CreateBox("box", 1, $scene)
    box.rotation.y = 0.75
    box.position.y = 1
    box.checkCollisions = true
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0.999 }, $scene)
    box.receiveShadows = true

    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", $scene)
    boxMaterial.diffuseTexture = new BABYLON.Texture("wall.gif", $scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    box.material = boxMaterial

    const ground = BABYLON.Mesh.CreateGround("ground1", 30, 30, 2, $scene)
    ground.receiveShadows = true
    ground.checkCollisions = true
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, $scene)

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", $scene)
    groundMaterial.diffuseTexture = new BABYLON.Texture("floor.gif", $scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    groundMaterial.diffuseTexture.uScale = 10
    groundMaterial.diffuseTexture.vScale = 10
    ground.material = groundMaterial

    $shadowGenerator = new BABYLON.ShadowGenerator(1024, light)
    $shadowGenerator.useContactHardeningShadow = true
    $shadowGenerator.addShadowCaster(box)

    return $scene
  }
</script>



<main on:click={ lockPointer }>
  <canvas bind:this={ $canvas } />
</main>



<style>
  :global(body) {
    background: black;
    color: white;
    padding: 0;
    margin: 0;
    width: 100vw;
    height: 100vh;
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
</style>
