import GUI from 'lil-gui'
import * as THREE from 'three'


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import * as CANNON from 'cannon-es'

import potionDrunkVertexShader from './shaders/potionDrunkEffect/vertex.glsl'
import potionDrunkFragmentShader from './shaders/potionDrunkEffect/fragment.glsl'

export const loadingManager = new THREE.LoadingManager()

const cameraShiftXZ = 2
export const variables = {
    cameraTargetYMin: 0,
    cameraTargetYMax: 6,

    cameraTargetXMin: -4,
    cameraTargetXMax: 5,
    cameraTargetZMin: -7,
    cameraTargetZMax: 4,

    bgColor: '#fff9b8',
    bloomPower: 0.15,
    bloomDiaposon: 3.5,
    bloomShift: -1.5,
}

/**
 * Sizes
 */
export const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Base
 */
// Debug
export const gui = new GUI({
    width: 400
})
gui.hide()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
export const scene = new THREE.Scene()


/**
 * Mouse
 */
export const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (event) =>
{
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

/**
 * Renderer
 */
export const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
//renderer.sortObjects = true
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(variables.bgColor)

gui.addColor(variables, 'bgColor').onChange(() =>
{
    renderer.setClearColor(variables.bgColor)
})

/**
 * Loaders
 */
// Texture loader
export const textureLoader = new THREE.TextureLoader(loadingManager)

// Perlin texture
export const perlinTexture = textureLoader.load('./perlin.png')
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

// Draco loader
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('draco/')

// GLTF loader
export const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

/** 
 * ambient light
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Мягкий общий свет
scene.add(ambientLight);

const ambientLightGUI = gui.addFolder('Ambient Light')
ambientLightGUI.close()
ambientLightGUI.add(ambientLight, 'intensity').min(0).max(5).step(0.01).name('Ambient Light Intensity')
ambientLightGUI.addColor(ambientLight, 'color').name('Ambient Light Color').onChange(() =>
{
    ambientLight.color.set(ambientLight.color)
})

/**
 * Raycaster
 */
export const raycaster = new THREE.Raycaster()


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update effect composer
    effectComposer.setSize(sizes.width, sizes.height)
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})



/**
 * Camera
 */
// Base camera
export const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height, 1.0, 35.0)
camera.position.set(11, 11, -11)
const target = new THREE.Vector3(0, 3.5, 0)
scene.add(camera)




// Controls
export const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(target.x, target.y, target.z)


// left / right
const minAzimuthAngle = 1.55
const maxAzimuthAngle = 3.15
controls.minAzimuthAngle = minAzimuthAngle
controls.maxAzimuthAngle = maxAzimuthAngle

// up / down
const minPolarAngle = 0.1
const maxPolarAngle = Math.PI / 2
controls.minPolarAngle = minPolarAngle
controls.maxPolarAngle = maxPolarAngle

// distance
controls.minDistance = 4
controls.maxDistance = 20

const cameraGroup = gui.addFolder('Camera')
cameraGroup.close()
const cameraAngleDelta = 5.0
// debug camera angle limits
cameraGroup.add(controls, 'minAzimuthAngle').min(minAzimuthAngle - cameraAngleDelta).max(minAzimuthAngle + cameraAngleDelta).step(0.01)
cameraGroup.add(controls, 'maxAzimuthAngle').min(minAzimuthAngle - cameraAngleDelta).max(minAzimuthAngle + cameraAngleDelta).step(0.01)
cameraGroup.add(controls, 'minPolarAngle').min(minPolarAngle - cameraAngleDelta).max(minPolarAngle + cameraAngleDelta).step(0.01)
cameraGroup.add(controls, 'maxPolarAngle').min(maxPolarAngle - cameraAngleDelta).max(maxPolarAngle + cameraAngleDelta).step(0.01)

// debug camera pan limits
cameraGroup.add(variables, 'cameraTargetXMin').min(-10).max(10).step(0.01)
cameraGroup.add(variables, 'cameraTargetXMax').min(-10).max(10).step(0.01)
cameraGroup.add(variables, 'cameraTargetYMin').min(-10).max(10).step(0.01)
cameraGroup.add(variables, 'cameraTargetYMax').min(-10).max(10).step(0.01)
cameraGroup.add(variables, 'cameraTargetZMin').min(-10).max(10).step(0.01)
cameraGroup.add(variables, 'cameraTargetZMax').min(-10).max(10).step(0.01)

// distance
cameraGroup.add(controls, 'minDistance').min(0).max(20).step(0.01)
cameraGroup.add(controls, 'maxDistance').min(0).max(20).step(0.01)

controls.addEventListener('change', () =>
{
    controls.target.x = Math.max(variables.cameraTargetXMin, Math.min(variables.cameraTargetXMax, controls.target.x))
    controls.target.y = Math.max(variables.cameraTargetYMin, Math.min(variables.cameraTargetYMax, controls.target.y))
    controls.target.z = Math.max(variables.cameraTargetZMin, Math.min(variables.cameraTargetZMax, controls.target.z))
})


/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, - 9.82, 0)
world.allowSleep = true

const defaultMaterial = new CANNON.Material('default')
const ballMaterial = new CANNON.Material('ball')
const ballDefaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    ballMaterial, 
    {
        friction: 0.2,
        restitution: 0.8
    }
)
world.addContactMaterial(ballDefaultContactMaterial)

const ballSize = 0.5
const sphereShape = new CANNON.Sphere(ballSize)
const ballBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(2, 2, 0),
    shape: sphereShape,
    material: ballMaterial
})
ballBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
world.addBody(ballBody)



// ball mesh 
const ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(ballSize, 15, 15),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
)
// пока что забил на это
//scene.add(ballMesh)
gltfLoader.load(
    'collisions.glb',
    (gltf) =>
    {
        gltf.scene.traverse((child) => {
            if (child.isMesh && child.name.includes('box')) {
                // Вычисляем bounding box
                const box = child.geometry.boundingBox;
                const size = new THREE.Vector3();
                box.getSize(size); // Получаем размеры (ширина, высота, глубина)

                // Половинные размеры для CANNON.Box
                const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
                const boxShape = new CANNON.Box(halfExtents);

                // Получаем мировую позицию меша
                const worldPosition = new THREE.Vector3();
                child.getWorldPosition(worldPosition);

                // Создаём физическое тело
                const boxBody = new CANNON.Body({
                    mass: 0, // Статическое тело
                    position: new CANNON.Vec3(worldPosition.x, worldPosition.y, worldPosition.z),
                    shape: boxShape,
                    material: defaultMaterial,
                });
                world.addBody(boxBody);

                // Создаём отладочный меш (для визуализации коллизии)
                // const boxMesh = new THREE.Mesh(
                //     new THREE.BoxGeometry(size.x, size.y, size.z), // Полные размеры для Three.js
                //     new THREE.MeshStandardMaterial({ color: 0xff0000, depthTest: false, wireframe: true })
                // );
                // boxMesh.position.copy(worldPosition);
                // scene.add(boxMesh);
            }
        });
    }
)

export function physicsTick(deltaTime) {
    world.step(1 / 60, deltaTime, 3)
    if (ballMesh != null) {
        ballMesh.position.copy(ballBody.position)
        ballMesh.quaternion.copy(ballBody.quaternion)
    }
}




const bakedTexture = textureLoader.load('baked_portfolio0002.jpg')
const bakedTexture2 = textureLoader.load('baked_portfolio20002.jpg')
const bakedTexture3 = textureLoader.load('baked_portfolio30002.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace
bakedTexture2.flipY = false
bakedTexture2.colorSpace = THREE.SRGBColorSpace
bakedTexture3.flipY = false
bakedTexture3.colorSpace = THREE.SRGBColorSpace

const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
const bakedMaterial2 = new THREE.MeshBasicMaterial({ map: bakedTexture2 })
const bakedMaterial3 = new THREE.MeshBasicMaterial({ map: bakedTexture3 })
export let jblMesh = null
export let bottle = null
gltfLoader.load(
    'portfolio.glb',
    (gltf) =>
    {
        
        gltf.scene.children.find((child) => child.name == 'scene1').material = bakedMaterial
        gltf.scene.children.find((child) => child.name == 'scene2').material = bakedMaterial2
        gltf.scene.children.find((child) => child.name == 'scene3').material = bakedMaterial3
        jblMesh = gltf.scene.children.find((child) => child.name == 'jbl')
        jblMesh.material = bakedMaterial3
        bottle = gltf.scene.children.find((child) => child.name == 'bottle')
        bottle.material = bakedMaterial2
        scene.add(gltf.scene)
    }
)



/**
 * Post processing
 */
export const effectComposer = new EffectComposer(renderer)
effectComposer.setSize(sizes.width, sizes.height)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

/**
 * Bloom
 */
export const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.enabled = true
unrealBloomPass.threshold = 0.01
unrealBloomPass.radius = 0.03
unrealBloomPass.strength = 0.1
effectComposer.addPass(unrealBloomPass)
const bloom = gui.addFolder('Bloom')
bloom.close()
bloom.add(variables, 'bloomPower').min(0).max(2).step(0.01).name('power')
bloom.add(variables, 'bloomDiaposon').min(0).max(10).step(0.01).name('diaposon')
bloom.add(variables, 'bloomShift').min(-10).max(10).step(0.01).name('shift')
bloom.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.01).name('threshold')
bloom.add(unrealBloomPass, 'radius').min(0).max(10).step(0.01).name('radius')


/**
 * Outline pass
 */
export const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.enabled = true
outlinePass.edgeStrength = 6.0; // Толщина обводки
outlinePass.edgeGlow = 0.5; // Свечение (0 для чёткой обводки)
outlinePass.edgeThickness = 1.0; // Чёткость края
outlinePass.visibleEdgeColor.set(0x00ff00); // Цвет обводки (зелёный)
outlinePass.hiddenEdgeColor.set(0x00ff00); // Цвет для скрытых краев

effectComposer.addPass(outlinePass);


/**
 * Potion Drunk Shader
 */
const DrunkPotionShader = {
    uniforms:
    {
        tDiffuse: { value: null },
        uTime: { value: null },
        uStrength: { value: 0.0 },
    },
    vertexShader: potionDrunkVertexShader,
    fragmentShader: potionDrunkFragmentShader
}
export const drunkPotionShaderPass = new ShaderPass(DrunkPotionShader)
drunkPotionShaderPass.enabled = false
drunkPotionShaderPass.material.uniforms.uTime.value = 0
effectComposer.addPass(drunkPotionShaderPass)

//** gamma correction */
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
effectComposer.addPass(gammaCorrectionPass)


const gl = renderer.getContext();
