varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vScreenPos; // Экранные координаты

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz; // Нормаль в пространстве вида
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz; // Позиция в мировом пространстве
    vUv = uv;
    vScreenPos = gl_Position;
}