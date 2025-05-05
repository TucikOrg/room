import { drunkPotionShaderPass, bottle, raycaster, outlinePass } from "./setup";
import { gsap } from 'gsap';

const drinkingAudio = new Audio('minecraft_drinking.mp3');
let effectActive = false

let potionSelected = false
export function tickPotion(canIntersect, elapsedTime) {
    drunkPotionShaderPass.material.uniforms.uTime.value = elapsedTime

    if (canIntersect && bottle != null && effectActive == false) {
        const intersects = raycaster.intersectObject(bottle)
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer'
            outlinePass.selectedObjects = [bottle];
            potionSelected = true
        } else {
            document.body.style.cursor = 'default'
            outlinePass.selectedObjects = [];
            potionSelected = false
        }
    }
}

window.addEventListener('click', () => {
    
    
    if (potionSelected && effectActive == false) {
        potionSelected = false
        document.body.style.cursor = 'default'
        outlinePass.selectedObjects = [];
        effectActive = true
        drinkingAudio.play()
        window.setTimeout(() => {
            drunkPotionShaderPass.enabled = true
            gsap.to(drunkPotionShaderPass.material.uniforms.uStrength, { value: 0.1, duration: 2.5 })
            setTimeout(() => {
                gsap.to(drunkPotionShaderPass.material.uniforms.uStrength, { value: 0, duration: 1.5, onComplete: () => {
                    drunkPotionShaderPass.enabled = false
                    drunkPotionShaderPass.material.uniforms.uStrength.value = 0
                    effectActive = false
                }})
            }, 4000)
        }, 1000)
    }
})