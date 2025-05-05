varying vec2 vUv;
varying vec3 vFragPos;
varying mat4 vModelMatrix;

void main()
{
    vec3 newPosition = position;

    // Final position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vFragPos = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    vUv = uv;
    vModelMatrix = modelMatrix;
}