

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vScreenPos;


uniform sampler2D uPerlinTexture;
uniform float uGodraysStrength;
uniform vec3 uCameraDirection;
uniform vec3 uCameraPosition;


const float PI = 3.1415926535897932384626433832795;

void main()
{
    
    float perlin = texture2D(uPerlinTexture, vec2(vUv.x * 5.0, vUv.y * 10.0)).r;
    float mask = smoothstep(1.0, 0.0, abs(vUv.x - 0.5) * 2.0); // Мягкие края
    float dist = vUv.y;
    mask *= dist;
    mask *= smoothstep(1.0, 0.0, dist / 0.9);


    // Рассчитываем угол между нормалью и направлением взгляда
    float fresnel = dot(vNormal, uCameraDirection);
    float rad = acos(fresnel);
    float factor = clamp(1.0 - rad / (PI * 0.5), 0.0, 1.0);
    
    
    float heightDiff = uCameraPosition.y - vWorldPosition.y;
    float heightFade = smoothstep(0.0, 2.0, heightDiff); 

    vec3 rayColor = vec3(0.9961, 0.9725, 0.8157);


    // Экранные координаты (NDC: -1..1)
    vec2 ndc = vScreenPos.xy / vScreenPos.w; // Делим на w для перспективного преобразования
    vec2 dNdcDx = dFdx(ndc); // Изменение ndc по X
    vec2 dNdcDy = dFdy(ndc); // Изменение ndc по Y
    float projectionScale = length(dNdcDx) + length(dNdcDy); // Примерный размер проекции
    // Затухание на основе размера проекции
    float projectionFade = clamp(projectionScale * 10.0, 0.0, 1.0); // Настройте 10.0

    gl_FragColor = vec4(rayColor,  mask * uGodraysStrength * factor * heightFade);
    gl_FragColor = vec4(vec3(length(dNdcDx * 100.0)), 1.0);
}