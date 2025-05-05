import GUI from 'lil-gui'
import * as THREE from 'three'

import {
    textureLoader, gltfLoader, perlinTexture, gui, 
    scene, raycaster, mouse, camera, outlinePass, controls,
    sizes, drunkPotionShaderPass, variables, unrealBloomPass,
    effectComposer, loadingManager, renderer, physicsTick
} from '/setup.js'

import * as CANNON from 'cannon-es'

import { tickSmoke } from '/coffeSmoke.js'

import { sceneReady } from './loading.js' 
import { points, tickLabels } from './points.js'
import { tickJbl } from './music.js'
import { tickPotion } from './potion.js'



document.querySelectorAll('.start button').forEach(button => {
    button.addEventListener('click', function (e) {
        const rect = button.getBoundingClientRect();
        const bubble = document.createElement('span');
        bubble.classList.add('bubble');
        bubble.style.setProperty('--offset-x', `${e.offsetX - 50}px`)
        bubble.style.setProperty('--offset-y', `${e.offsetY - 50}px`)
        button.appendChild(bubble);

        //Remove the bubble after animation ends
        bubble.addEventListener('animationend', () => {
            bubble.remove();
        });
    });
});






/**
 * Animate
 */
const clock = new THREE.Clock()
let previousElapsedTime = 0



const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousElapsedTime
    previousElapsedTime = elapsedTime


    

    const cameraPos = camera.position;
    const target = controls.target;
    let cameraDirection = new THREE.Vector3();
    cameraDirection.subVectors(target, cameraPos).normalize();

  
    //console.log(cameraPos.x.toFixed(2), cameraPos.y.toFixed(2), cameraPos.z.toFixed(2))

    raycaster.setFromCamera(mouse, camera)

    

    // Update controls
    controls.update()

    tickLabels(camera)
    tickSmoke(elapsedTime)
    let canIntersect = tickJbl(elapsedTime, deltaTime, true)
    tickPotion(canIntersect, elapsedTime)
    physicsTick(deltaTime)
    
    const lightVector = new THREE.Vector3(0, 0, 1)
    const dotProduct = cameraDirection.dot(lightVector);
    const angleRad = Math.acos(dotProduct); 
    const angleDeg = angleRad * (180 / Math.PI); 
    const bloomStrength = Math.max(0, 1 - (angleDeg / 180)) * variables.bloomDiaposon + variables.bloomShift;
    unrealBloomPass.strength = bloomStrength * variables.bloomPower

    // Render
    //renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()