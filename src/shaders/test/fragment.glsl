varying vec2 vUv;
varying vec3 vFragPos;
uniform vec3 cameraPos;

varying mat4 vModelMatrix;

// Simple noise function for point-like effect
float random(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

// Ray-cube intersection (axis-aligned cube)
bool intersectCube(vec3 ro, vec3 rd, vec3 cubeMin, vec3 cubeMax, out float tMin, out float tMax) {
    vec3 t1 = (cubeMin - ro) / rd;
    vec3 t2 = (cubeMax - ro) / rd;
    vec3 tMinVec = min(t1, t2);
    vec3 tMaxVec = max(t1, t2);
    tMin = max(max(tMinVec.x, tMinVec.y), tMinVec.z);
    tMax = min(min(tMaxVec.x, tMaxVec.y), tMaxVec.z);
    return tMin < tMax && tMax > 0.0;
}

void main()
{
    float sphereRadius = 1.0; // Radius of the sphere
    vec3 sphereCenter = vec3(0.0, 2.0, 0.0);


    // Ray origin (camera position) and direction
    vec3 ro = cameraPos;
    vec3 rd = normalize(vFragPos - cameraPos); // Ray direction from camera to fragment

    // Cube bounds in world space (assuming unit cube transformed by model matrix)
    vec3 cubeMin = vec3(vModelMatrix * vec4(-1.0, -1.0, -1.0, 1.0));
    vec3 cubeMax = vec3(vModelMatrix * vec4(1.0, 1.0, 1.0, 1.0));

    // Ray-cube intersection
    float tMin, tMax;
    if (!intersectCube(ro, rd, cubeMin, cubeMax, tMin, tMax)) {
        discard; // Ray misses cube
    }

    // March through the cube
    float t = max(tMin, 0.0); // Start at cube entry point
    float maxDist = tMax - tMin; // Max distance to march
    float stepSize = 0.01; // Adjust for quality vs. performance
    float densityAccum = 0.0; // Accumulated density for blending

    for (float i = 0.0; i < maxDist; i += stepSize) {
        vec3 pos = ro + t * rd; // Current position along ray
        float dist = length(pos - sphereCenter); // Distance to sphere center

        if (dist < sphereRadius) {
            // Inside sphere
            float tNorm = dist / sphereRadius; // Normalized distance (0 to 1)
            float density = exp(-4.0 * tNorm * tNorm); // Density falloff

            // Point-like effect with noise
            float noise = random(pos * 10.0); // Scale for point density
            if (noise > 0.5) {
                // Accumulate density (blend points)
                densityAccum += density * stepSize;
                gl_FragColor = vec4(1.0, 1.0, 1.0, densityAccum);
                // Optional: Early exit for opaque points
                if (densityAccum > 0.9) break;
            }
        }

        t += stepSize;
        if (t > tMax) break; // Exit cube
    }

    // If no sphere points hit, discard or render cube transparently
    if (densityAccum == 0.0) {
        discard; // Or render cube face with low alpha
    }

    //gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), 1.0);


}