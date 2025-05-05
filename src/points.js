import * as THREE from 'three';
import { gui, sizes } from './setup';
import { sceneReady } from './loading';

const seeLabelRadius = 60

// labels
export const points = [
    {
        name: 'mac book',
        position: new THREE.Vector3(0.0, 4.1, 0.5),
        element: document.querySelector('.point-0') // mac book
    }, 
    {
        name: 'algorithms book',
        position: new THREE.Vector3(-3.5, 3.5, 0.5),
        element: document.querySelector('.point-1') // alghoritms book
    },
    {
        name: 'eng book',
        position: new THREE.Vector3(1.79, 3.59, 0.99),
        element: document.querySelector('.point-2') // eng book
    },
    {
        name: 'me picture',
        position: new THREE.Vector3(4.8, 5, 4.52),
        element: document.querySelector('.point-3') // me picture
    },
    {
        name: 'hot chocolate',
        position: new THREE.Vector3(-1.75, 3.66, 0.72),
        element: document.querySelector('.point-4') // hot chocolate
    },
    {
        name: 'palm tree',
        position: new THREE.Vector3(4.06, 1.72, 0.850000000000001),
        element: document.querySelector('.point-5') // palm tree
    },
    {
        name: 'my stack',
        position: new THREE.Vector3(-4.36, 5.5, 0.45),
        element: document.querySelector('.point-6') // my stack
    },
]

const musicPanel = {
    name: 'music panel',
    position: new THREE.Vector3(-3.29, 4.1, -5.5),
    element: document.querySelector('.music-panel') // music panel
}

const lables = gui.addFolder('Labels')
for (const point of points) {
    const pointFolder = lables.addFolder(point.name)
    pointFolder.close()
    pointFolder.add(point.position, 'x').min(-5).max(5).step(0.01)
    pointFolder.add(point.position, 'y').min(-5).max(5).step(0.01)
    pointFolder.add(point.position, 'z').min(-5).max(5).step(0.01)
}

const musicPanelFolder = lables.addFolder(musicPanel.name)
musicPanelFolder.close()
musicPanelFolder.add(musicPanel.position, 'x').min(-7).max(7).step(0.01)
musicPanelFolder.add(musicPanel.position, 'y').min(-7).max(7).step(0.01)
musicPanelFolder.add(musicPanel.position, 'z').min(-7).max(7).step(0.01)


let cursorX = 100000000
let cursorY = 100000000
window.addEventListener('mousemove', (event) =>
{
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1

    cursorX = mouseX * 0.5 * sizes.width
    cursorY = - mouseY * 0.5 * sizes.height

    //console.log(mouseX.toFixed(3))
})


export function tickLabels(camera) {
    // move labels
    if (sceneReady) {
        for (const point of points) {
            const screenPosition = point.position.clone()
            screenPosition.project(camera)
    
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`

            const translate = new THREE.Vector2(translateX, translateY)
            const distance = translate.distanceTo(new THREE.Vector2(cursorX, cursorY))
            if (distance < seeLabelRadius) {
                point.element.classList.add('visible')
            } else {
                point.element.classList.remove('visible')
            }
            //console.log(point.name, distance.toFixed(2))
        }

        const screenPosition = musicPanel.position.clone()
        screenPosition.project(camera)
        const translateX = screenPosition.x * sizes.width * 0.5
        const translateY = - screenPosition.y * sizes.height * 0.5
        musicPanel.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
    }
}