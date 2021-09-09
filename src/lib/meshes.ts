import { get } from "svelte/store"

import { scene } from "../stores/scene"
import { meshesWithShadows, staticMeshes } from "../stores/light"

export function createWindow(name: string, size, position, texturePath = "glass.gif", color = new BABYLON.Color3(1, 1, 1), alpha = 0.5) {
  const glass = new BABYLON.PBRMetallicRoughnessMaterial(name, get(scene))
  glass.baseColor = color
  glass.metallic = 20
  glass.roughness = 0.15
  glass.alpha = alpha

  // Set roughness texture
  glass.metallicRoughnessTexture = new BABYLON.Texture(texturePath, get(scene), false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
  glass.metallicRoughnessTexture.uScale = size.y / 2
  glass.metallicRoughnessTexture.vScale = size.z / 2

  const window = BABYLON.Mesh.CreateBox(name, 1, get(scene))
  window.scaling = size
  window.position = position
  window.physicsImpostor = new BABYLON.PhysicsImpostor(window, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, get(scene))
  window.checkCollisions = true
  window.receiveShadows = true
  window.material = glass
}

export function createBox(name: string, size, position, diffuseTexturePath: string, bumpTexturePath = "", { rotation = null, mass = 0, textureAxis = ["y", "z"], textureScale = 2, specularColor = new BABYLON.Color3(0.15, 0.15, 0.15) } = {}) {
  const material = createMaterial(name, diffuseTexturePath, bumpTexturePath, size, textureAxis, textureScale, specularColor)

  const mesh = BABYLON.Mesh.CreateBox(name, 1, get(scene))
  mesh.scaling = size
  mesh.position = position
  mesh.material = material

  if (rotation) mesh.rotation = rotation

  mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: mass }, get(scene))
  mesh.checkCollisions = true
  mesh.receiveShadows = true

  meshesWithShadows.set([...get(meshesWithShadows), mesh])

  if (mass == 0) staticMeshes.set([...get(staticMeshes), mesh])
}

export function createPlane(name: string, size, position, rotation, diffuseTexturePath: string, bumpTexturePath = "", { textureAxis = ["x", "y"], textureScale = 2, specularColor = new BABYLON.Color3(0.75, 0.75, 0.75), collisionEnabled = true } = {}) {
  const material = createMaterial(name, diffuseTexturePath, bumpTexturePath, size, textureAxis, textureScale, specularColor)

  const mesh = BABYLON.MeshBuilder.CreatePlane(name, { height: size.y, width: size.x, sideOrientation: BABYLON.Mesh.DOUBLESIDE })
  mesh.rotation = rotation
  mesh.position = position
  mesh.material = material
  mesh.receiveShadows = true

  if (collisionEnabled) {
    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 })
    mesh.checkCollisions = true
  }

  meshesWithShadows.set([...get(meshesWithShadows), mesh])
  staticMeshes.set([...get(staticMeshes), mesh])
}

function createMaterial(name, diffuseTexturePath, bumpTexturePath, size, textureAxis, textureScale, specularColor) {
  const material = new BABYLON.StandardMaterial(`${ name }Material`, get(scene))
  material.diffuseTexture = new BABYLON.Texture(diffuseTexturePath, get(scene), false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
  material.diffuseTexture.uScale = size[textureAxis[0]] / textureScale
  material.diffuseTexture.vScale = size[textureAxis[1]] / textureScale
  
  if (bumpTexturePath) {
    material.bumpTexture = new BABYLON.Texture(bumpTexturePath, get(scene), false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE)
    material.bumpTexture.uScale = size[textureAxis[0]] / textureScale
    material.bumpTexture.vScale = size[textureAxis[1]] / textureScale

    material.invertNormalMapX = true
    material.invertNormalMapY = true
    material.specularColor = specularColor
  }

  return material
}
