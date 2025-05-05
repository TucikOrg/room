
import * as THREE from 'three'


import coffeeSmokeVertexShader from './shaders/coffeSmoke/vertex.glsl'
import coffeSmokeFragmentShader from './shaders/coffeSmoke/fragment.glsl'

import { scene, textureLoader, gui } from './setup.js'

const perlinTexture = textureLoader.load('./perlin.png')
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

// Geometry
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
smokeGeometry.translate(0, 0.5, 0)
smokeGeometry.scale(0.3, 3.6, 0.3)


// Material
const smokeMaterial = new THREE.ShaderMaterial({
    vertexShader: coffeeSmokeVertexShader,
    fragmentShader: coffeSmokeFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
        uPerlinTexture: {
            value: perlinTexture
        },
        uTime: {
            value: 0
        },
    }
})


// Mesh
const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
smoke.position.set(-1.75, 3.51, 0.74)
smoke.rotation.y = 0.818407346410207
scene.add(smoke)


const smokeFolder = gui.addFolder('Smoke')
smokeFolder.close()
smokeFolder.add(smoke.position, 'x').min(-10).max(10).step(0.01).name('position x')
smokeFolder.add(smoke.position, 'y').min(-10).max(10).step(0.01).name('position y')
smokeFolder.add(smoke.position, 'z').min(-10).max(10).step(0.01).name('position z')
smokeFolder.add(smoke.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('rotation x')
smokeFolder.add(smoke.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('rotation y')
smokeFolder.add(smoke.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('rotation z')

export function tickSmoke(time) {
    smokeMaterial.uniforms.uTime.value = time
}