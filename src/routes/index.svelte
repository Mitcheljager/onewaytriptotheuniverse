<script lang="ts">
  import { onMount } from "svelte"
  import * as BABYLON from "babylonjs"
  import Cannon from "cannon"

  let canvas: HTMLCanvasElement
  let scene
  let camera

  onMount(() => {
    const engine = new BABYLON.Engine(canvas, true)

    scene = createScene(engine)
    engine.runRenderLoop(() => scene.render())
  })

  function createScene(engine) {
    const gravity = new BABYLON.Vector3(0, 0, 0)
    const scene = new BABYLON.Scene(engine)
    scene.gravity = gravity
    scene.collisionsEnabled = true
    scene.enablePhysics(gravity, new BABYLON.CannonJSPlugin(true, 4, Cannon))

    camera = setCamera()

    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-20, 15, -10), scene)

    const ambienceLight = new BABYLON.HemisphericLight("ambience", new BABYLON.Vector3(0, 30, 0), scene)
    ambienceLight.intensity = 0.1
    
    const box = BABYLON.Mesh.CreateBox("box", 2, scene)
    box.rotation.y = 0.75
    box.position.y = 2
    box.checkCollisions = true
    box.mass = 0.95
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: box.mass }, scene)

    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene)
    boxMaterial.diffuseTexture = new BABYLON.Texture("public/wall.gif", scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    box.material = boxMaterial

    const ground = BABYLON.Mesh.CreateGround("ground1", 30, 30, 2, scene)
    ground.receiveShadows = true
    ground.checkCollisions = true
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene)
    groundMaterial.diffuseTexture = new BABYLON.Texture("public/floor.gif", scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    groundMaterial.diffuseTexture.uScale = 10
    groundMaterial.diffuseTexture.vScale = 10
    ground.material = groundMaterial

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light)
    shadowGenerator.getShadowMap().renderList.push(box)
    shadowGenerator.useBlurExponentialShadowMap = true

    camera.onCollide = (mesh) => {
      if (!mesh.mass && mesh.mass != 1) return

      const movementDirectionVector = camera.position.subtract(mesh.getAbsolutePosition()).negate()
      mesh.physicsImpostor.setLinearVelocity(movementDirectionVector.scale((1 - mesh.mass) * 10))
    }

    return scene
  }

  function setCamera() {
    const camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 5, 10), scene)

    // Attach camera to the scene
    camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, true)

    // Set collision box for camera
    camera.ellipsoid = new BABYLON.Vector3(1.75, 1.75, 1.75)
    camera.checkCollisions = true
    camera.applyGravity = true

    // Set camera movement to WASD
    camera.keysUp = [87]
    camera.keysDown = [83]
    camera.keysLeft = [65]
    camera.keysRight = [68]

    // Set "movement" speed
    camera.speed = 0.75

    // Set fov
    camera.fov = 1.2

    // Set sensitity and smoothing
    camera.angularSensibility = 15000
    camera.inertia = 0.85
    camera.panningInertia = 0

    return camera
  }

  function lockPointer() {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock
    canvas.requestPointerLock()
  }
</script>



<main on:click={ lockPointer }>
  <canvas bind:this={ canvas } />
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
    width: 100;
    height: 100%;
  }
</style>
