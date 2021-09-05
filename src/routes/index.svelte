<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import * as BABYLON from "babylonjs"

  import { lockPointer, setStandardCamera } from "../lib/camera"
  import { createPlayer, removePlayerEventListeners } from "../lib/player"
  import { createScene } from "../lib/scene"

  import { canvas, scene } from "../stores/scene"
  import { engine } from "../stores/engine"
  import { shadowGenerators, lights, createShadowGenerators, meshesWithShadows } from "../stores/light"

  onMount(() => {
    $engine = new BABYLON.Engine($canvas, true)

    createScene()
    setUpScene()

    setStandardCamera()
    createPlayer()

    createShadowGenerators()

    $engine.runRenderLoop(() => $scene.render())
  })

  onDestroy(() => {
    $lights = []
    $meshesWithShadows = []

    removePlayerEventListeners()
  })

  function setUpScene() {
    const sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(20, -30, -60), $scene)
    sun.intensity = 0.75
    $lights = [...$lights, sun]

    const point = new BABYLON.PointLight("point", new BABYLON.Vector3(0, 3, 0), $scene)
    point.intensity = 0.5
    $lights = [...$lights, point]

    const ambienceLight = new BABYLON.HemisphericLight("ambience", new BABYLON.Vector3(0, 30, 0), $scene)
    ambienceLight.intensity = 0.35
    
    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", $scene)
    boxMaterial.diffuseTexture = new BABYLON.Texture("wall.gif", $scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    // boxMaterial.bumpTexture = new BABYLON.Texture("wall_normal.png", $scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    
    const box = BABYLON.Mesh.CreateBox("box", 1, $scene)
    box.rotation.y = 0.75
    box.position.y = 1
    box.checkCollisions = true
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0.999 }, $scene)
    box.receiveShadows = true
    box.material = boxMaterial
    $meshesWithShadows = [...$meshesWithShadows, box]

    const glass = new BABYLON.PBRMetallicRoughnessMaterial("glass", $scene)
    glass.baseColor = new BABYLON.Color3(1, 1, 1)
    glass.emissiveColor = new BABYLON.Color3(0, 0, 0)
    glass.metallic = 20
    glass.roughness = 0.2
    glass.alpha = 0.5
    glass.metallicRoughnessTexture = new BABYLON.Texture("glass.gif", $scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    glass.metallicRoughnessTexture.uScale = 4
    glass.metallicRoughnessTexture.vScale = 10

    const window = BABYLON.Mesh.CreateBox("window", 1, $scene)
    window.scaling = new BABYLON.Vector3(0.1, 4, 10)
    window.position = new BABYLON.Vector3(-2, 2, 0)
    window.physicsImpostor = new BABYLON.PhysicsImpostor(window, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, $scene)
    window.checkCollisions = true
    window.receiveShadows = true
    window.material = glass
    $meshesWithShadows = [...$meshesWithShadows, window]

    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", $scene)
    wallMaterial.diffuseTexture = new BABYLON.Texture("wall_2.gif", $scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    wallMaterial.diffuseTexture.uScale = 4
    wallMaterial.diffuseTexture.vScale = 10

    const wall = BABYLON.Mesh.CreateBox("wall", 1, $scene)
    wall.scaling = new BABYLON.Vector3(0.1, 4, 10)
    wall.position = new BABYLON.Vector3(2, 2, 0)
    wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, $scene)
    wall.checkCollisions = true
    wall.receiveShadows = true
    wall.material = wallMaterial
    $meshesWithShadows = [...$meshesWithShadows, wall]

    const ceilingMaterial = new BABYLON.StandardMaterial("ceilingMaterial", $scene)
    ceilingMaterial.diffuseTexture = new BABYLON.Texture("wall_2.gif", $scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    ceilingMaterial.diffuseTexture.uScale = 10
    ceilingMaterial.diffuseTexture.vScale = 4

    const ceiling = BABYLON.Mesh.CreateBox("ceiling", 1, $scene)
    ceiling.scaling = new BABYLON.Vector3(4, 0.1, 10)
    ceiling.position = new BABYLON.Vector3(0, 4, 0)
    ceiling.physicsImpostor = new BABYLON.PhysicsImpostor(ceiling, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, $scene)
    ceiling.checkCollisions = true
    ceiling.receiveShadows = true
    ceiling.material = ceilingMaterial
    $meshesWithShadows = [...$meshesWithShadows, ceiling]

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", $scene)
    groundMaterial.diffuseTexture = new BABYLON.Texture("floor_2.gif", $scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    groundMaterial.diffuseTexture.uScale = 30
    groundMaterial.diffuseTexture.vScale = 30

    const ground = BABYLON.Mesh.CreateGround("ground1", 30, 30, 2, $scene)
    ground.receiveShadows = true
    ground.checkCollisions = true
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, $scene)
    ground.material = groundMaterial

    // $shadowGenerator = new BABYLON.ShadowGenerator(1024, sun)
    // $shadowGenerator.useContactHardeningShadow = true
    // $shadowGenerator.contactHardeningLightSizeUVRatio = 0.1
    // $shadowGenerator.transparencyShadow = true
    // $shadowGenerator.enableSoftTransparentShadow = true
    // $shadowGenerator.addShadowCaster(box)
    // $shadowGenerator.addShadowCaster(window)
    // $shadowGenerator.addShadowCaster(wall)
    // $shadowGenerator.addShadowCaster(ceiling)

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
