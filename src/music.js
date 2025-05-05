
import { jblMesh, raycaster, outlinePass } from './setup.js'

let jblSelected = false
export function tickJbl(elapsedTime, deltaTime, canIntersect) {
    if (jblMesh != null) {

        if (canIntersect) {
            const intersects = raycaster.intersectObject(jblMesh)
            if (intersects.length > 0) {
                document.body.style.cursor = 'pointer'
                outlinePass.selectedObjects = [jblMesh];
                jblSelected = true
            } else {
                document.body.style.cursor = 'default'
                outlinePass.selectedObjects = [];
                jblSelected = false
            }
        }
    }

    return jblSelected == false
}

const musicPannel = document.querySelector('.music-panel')
window.addEventListener('click', () => {
    if (jblSelected) {
        musicPannel.classList.toggle('visible')
    }
})

const musics = [
    {
        name: 'Demons',
        author: 'Imagine Dragons',
        audio: 'sounds/demons.mp3',
        image: 'images/daemons_label.jpg',
    }, 
    {
        name: 'Doubt',
        author: 'Twenty One Pilots',
        audio: 'sounds/doubt.mp3',
        image: 'images/doubt.jpeg',
    },
    {
        name: 'Bad guy',
        author: 'Billie Eilish',
        audio: 'sounds/bad_guy.mp3',
        image: 'images/bad_guy.jpg',
    }
]

let current = 1
let music = musics[current]
let playing = false
let audio = new Audio(music.audio);
audio.loop = true
audio.volume = 0.5
audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progress}%`;
});
const titleElement = document.querySelector('.title')
const authorElement = document.querySelector('.author')
const imageElement = document.querySelector('#music-icon')
imageElement.src = music.image
titleElement.innerHTML = music.name
authorElement.innerHTML = music.author

const nextMusic = document.querySelector('#next-music')
nextMusic.addEventListener('click', () => {
    current = (current + 1) % musics.length;
    music = musics[current];
    audio.src = music.audio;
    imageElement.src = music.image;
    titleElement.innerHTML = music.name;
    authorElement.innerHTML = music.author;

    if (playing) {
        audio.play();
    }
})
const previousMusic = document.querySelector('#previous-music')
previousMusic.addEventListener('click', () => {
    current = (current - 1) % musics.length;
    if (current < 0) {
        current = musics.length - 1;
    }
    music = musics[current];
    audio.src = music.audio;
    imageElement.src = music.image;
    titleElement.innerHTML = music.name;
    authorElement.innerHTML = music.author;

    if (playing) {
        audio.play();
    }
})

const playPauseElement = document.querySelector('#play-pause')
const progressBar = document.querySelector('.bar')
progressBar.parentElement.addEventListener('click', (event) => {
    if (audio) {
        const rect = progressBar.parentElement.getBoundingClientRect();
        const clickPosition = event.clientX - rect.left;
        const clickRatio = clickPosition / rect.width;
        audio.currentTime = clickRatio * audio.duration;
    }
});

playPauseElement.addEventListener('click', () => {
    if (playing) {
        audio.pause()
        playPauseElement.src = './icons/play.svg'
    } else {
        audio.play()
        playPauseElement.src = './icons/pause.svg'
    }
    playing = !playing
})