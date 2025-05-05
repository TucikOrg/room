import * as THREE from 'three'
import { scene, loadingManager } from "./setup"
import { gsap } from 'gsap'
import { points } from "./points"


const welcomeScreenActive = true


let startSound = new Audio('sounds/start.wav');
startSound.volume = 1.0
export let sceneReady = false
const overlayElement = document.querySelector('.overlay')
const soundEffectElement = document.querySelector('.sound-effect')
const startScreen = document.querySelector('.start')
if (welcomeScreenActive) {
    const startButton = document.querySelector('#start-button')
    const loadingBarElement = document.querySelector('.loading-bar')


    startButton.addEventListener('click', () =>
    {
        startSound.play()

        soundEffectElement.classList.add('animate')

        window.setTimeout(() => {
            sceneReady = true
            for (const point of points) {
                point.element.classList.add('visible')
            }
            gsap.to(startScreen, { duration: 0.25, opacity: 0, 
                onComplete: () =>
                {
                    startScreen.style.display = 'none'
                }
            })
        }, 800) 
    })

    loadingManager.onLoad = () => {
        window.setTimeout(() =>
        {
            gsap.to(overlayElement, { duration: 3, opacity: 0, delay: 1, 
                onComplete: () =>
                {
                    overlayElement.style.display = 'none'
                }
             })

            gsap.to(loadingBarElement, { duration: 0.5, opacity: 0, delay: 1, 
                onComplete: () => {
                    loadingBarElement.style.display = 'none'
                    startButton.style.display = 'block'
                    gsap.to(startButton.style, { duration: 0.5, opacity: 1 })
                }
            })
        }, 500)
    }


    const loadingBarProgressElement = document.querySelector('.loading-bar .progress')
    const loadingBarTextElement = document.querySelector('.loading-bar .text')
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarProgressElement.style.width = `${progressRatio * 100}%`
        loadingBarTextElement.innerHTML = `${Math.round(progressRatio * 100)}%`
    }
} else {
    soundEffectElement.style.display = 'none'
    startScreen.style.display = 'none'
    overlayElement.style.display = 'none'
    sceneReady = true
    for (const point of points) {
        point.element.classList.add('visible')
    }
}


