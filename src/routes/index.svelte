<script lang="ts">
  import { onMount } from "svelte"
  import * as BABYLON from "babylonjs"
  import Cannon from "cannon"

  let canvas: HTMLCanvasElement
  let scene
  let camera
  let shadowGenerator
  let player
  let playerMovingInDirection = {
    forward: 0,
    right: 0,
    backward: 0,
    left: 0,
    up: 0,
    down: 0
  }

  onMount(() => {
    const engine = new BABYLON.Engine(canvas, true)

    scene = createScene(engine)
    createPlayerMesh(shadowGenerator)
    engine.runRenderLoop(() => scene.render())
  })

  function createScene(engine) {
    const gravity = new BABYLON.Vector3(0, 0, 0)
    const scene = new BABYLON.Scene(engine)
    scene.gravity = gravity
    scene.collisionsEnabled = true
    scene.enablePhysics(gravity, new BABYLON.CannonJSPlugin(true, 4, Cannon))

    camera = setCamera()

    const light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-30, 30, -10), scene)
    light.intensity = 0.85

    const ambienceLight = new BABYLON.HemisphericLight("ambience", new BABYLON.Vector3(0, 30, 0), scene)
    ambienceLight.intensity = 0.1
    
    const box = BABYLON.Mesh.CreateBox("box", 1, scene)
    box.rotation.y = 0.75
    box.position.y = 1
    box.checkCollisions = true
    box.mass = 0.999
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: box.mass }, scene)
    box.receiveShadows = true

    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene)
    boxMaterial.diffuseTexture = new BABYLON.Texture("wall.gif", scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    box.material = boxMaterial

    const ground = BABYLON.Mesh.CreateGround("ground1", 30, 30, 2, scene)
    ground.receiveShadows = true
    ground.checkCollisions = true
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene)
    groundMaterial.diffuseTexture = new BABYLON.Texture("floor.gif", scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    groundMaterial.diffuseTexture.uScale = 10
    groundMaterial.diffuseTexture.vScale = 10
    ground.material = groundMaterial

    shadowGenerator = new BABYLON.ShadowGenerator(1024, light)
    shadowGenerator.useContactHardeningShadow = true
    shadowGenerator.addShadowCaster(box)

    return scene
  }

  function setCamera() {
    const camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 5, 3), scene)

    // Attach camera to the scene
    camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, true)

    // Set collision box for camera
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1)
    camera.checkCollisions = true
    camera.applyGravity = true

    camera.rotation = new BABYLON.Vector3(0, 0, 0)

    camera.minX = 0;
    camera.minY = 0;
    camera.minZ = 0;

    // Set "movement" speed
    camera.speed = 0.75

    // Set fov
    camera.fov = 1.2

    // Set sensitity and smoothing
    camera.angularSensibility = 7500
    camera.inertia = 0.6

    camera.position.y = 3

    return camera
  }

  function createPlayerMesh(shadowGenerator) {
    // Create player box for shadows and physics
    player = BABYLON.Mesh.CreateCylinder("player", 1.75, 0.5, 0.5, 10, 1, scene)
    player.layerMask = 0
    player.position.y = 1
    player.position.z = 4
    player.mass = 0.9
    player.rotation = BABYLON.Vector3.Zero()
    player.checkCollisions

    shadowGenerator.addShadowCaster(player)

    player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0.5, restitution: 0, friction: .01 }, scene)
    player.physicsImpostor.physicsBody.linearDamping = 0.85
    player.physicsImpostor.physicsBody.angularDamping = 0.9999999999999999

    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("keydown", () => onKey(1))
    canvas.addEventListener("keyup", () => onKey(0))

    scene.registerBeforeRender(update)
  }

  function onPointerMove(event) {
    rotate(player, new BABYLON.Vector3(0, event.movementX, 0), 0.015)
  }

  function onKey(force) {
    if (event.key == "w") playerMovingInDirection.forward = force
    if (event.key == "d") playerMovingInDirection.right = force
    if (event.key == "s") playerMovingInDirection.backward = force
    if (event.key == "a") playerMovingInDirection.left = force
    if (event.key == " ") playerMovingInDirection.up = force
    if (event.key == "c") playerMovingInDirection.down = force
  }

  async function update() {
    if (playerMovingInDirection.forward) translate(player, new BABYLON.Vector3(0, 0, 1))
    if (playerMovingInDirection.right) translate(player, new BABYLON.Vector3(1, 0, 0))
    if (playerMovingInDirection.backward) translate(player, new BABYLON.Vector3(0, 0, -1))
    if (playerMovingInDirection.left) translate(player, new BABYLON.Vector3(-1, 0, 0))
    if (playerMovingInDirection.up) translate(player, new BABYLON.Vector3(0, 1, 0))
    if (playerMovingInDirection.down) translate(player, new BABYLON.Vector3(0, -1, 0))

    // player.rotation.y = camera.rotation
    camera.position = player.position.add(new BABYLON.Vector3(0, 1.25, 0))

    var eulerRotation = BABYLON.Vector3.Zero()

    // Force natural camera to only move in y and move camera with player mesh rotation
    player.physicsImpostor.physicsBody.quaternion.toEuler(eulerRotation)
    camera.rotation.y = eulerRotation.y

    player.rotationQuaternion.x = 0
    player.rotationQuaternion.z = 0
  }

  function rotate(mesh, direction, power) {
    mesh.physicsImpostor.setAngularVelocity(
      mesh.physicsImpostor.getAngularVelocity().add(
        direction.scale(power)
      )
    )
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
    width: 100;
    height: 100%;
  }
</style>
