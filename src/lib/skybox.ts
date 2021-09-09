import { get } from "svelte/store"

import { scene } from "../stores/scene"
import { lightsCastingShadows, glows } from "../stores/light"

export function createStandardSkybox() {
  const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000 }, get(scene))
  const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", get(scene))
  skyboxMaterial.backFaceCulling = false
  skyboxMaterial.reflectionTexture = BABYLON.CubeTexture.CreateFromImages(["skyboxes/space_left.jpg", "skyboxes/space_up.jpg", "skyboxes/space_front.jpg", "skyboxes/space_right.jpg", "skyboxes/space_down.jpg", "skyboxes/space_back.jpg"], get(scene))
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
  skyboxMaterial.disableLighting = true
  skybox.material = skyboxMaterial

  const sunColor = new BABYLON.Color3(1, 1, 1)

  const sunMesh = BABYLON.Mesh.CreateSphere("sun", 12, 20, get(scene))
  sunMesh.material = new BABYLON.StandardMaterial("sunEmmisive", get(scene))
  sunMesh.material.emissiveColor = sunColor
  sunMesh.position = new BABYLON.Vector3(-300, 450, 900)
  
  const sunGlow = new BABYLON.GlowLayer("sunGlow", get(scene), { blurKernelSize: 128 })
  sunGlow.intensity = 20
  glows.set([...get(glows), sunGlow])
  sunGlow.addIncludedOnlyMesh(sunMesh)

  const sunLight = new BABYLON.DirectionalLight("sunLight", new BABYLON.Vector3(20, -30, -60), get(scene))
  sunLight.intensity = 1
  sunLight.diffuse = sunColor
  sunLight.specular = sunColor
  lightsCastingShadows.set([...get(lightsCastingShadows), sunLight])

  // Ambience light that creates an overall lightness, filling in shadows
  const ambienceLight = new BABYLON.HemisphericLight("ambience", new BABYLON.Vector3(0, 30, 0), get(scene))
  ambienceLight.intensity = 0.1
}
