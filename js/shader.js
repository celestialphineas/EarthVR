var generalVS = `
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * mvPosition;
}
`;

var nightFS = `
uniform sampler2D nightTexture;

varying vec2 vUv;
varying vec3 vNormal;

struct PointLight {
    vec3 position;
    float distance;
    vec3 color;
};
uniform PointLight pointLights[NUM_POINT_LIGHTS];

void main( void ) {
    vec4 nightColor = vec4(texture2D( nightTexture, vUv ).rgb, 1.0);
    vec4 dayColor = vec4(0, 0, 0, 0);
    vec3 sunDirection = pointLights[0].position;

    // compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
    float cosineAngleSunToNormal = dot(normalize(vNormal), sunDirection);

    // sharpen the edge beween the transition
    cosineAngleSunToNormal = clamp( cosineAngleSunToNormal / 100.0, -1.0, 1.0);

    // convert to 0 to 1 for mixing
    float mixAmount = cosineAngleSunToNormal * 0.5 + 0.5;

    // Select day or night texture based on mixAmount.
    vec4 color = mix( nightColor, dayColor, mixAmount );

    gl_FragColor += vec4(color);

    // comment in the next line to see the mixAmount
    //gl_FragColor = vec4( mixAmount, mixAmount, mixAmount, 1.0 );
}
`;

// This stuff works, currently we do not use the scattering model
var atmosphereVS = `
mat4 inverse(mat4 m) {
    float
        a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
        a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
        a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
        a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],
  
        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,
  
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  
    return mat4(
        a11 * b11 - a12 * b10 + a13 * b09,
        a02 * b10 - a01 * b11 - a03 * b09,
        a31 * b05 - a32 * b04 + a33 * b03,
        a22 * b04 - a21 * b05 - a23 * b03,
        a12 * b08 - a10 * b11 - a13 * b07,
        a00 * b11 - a02 * b08 + a03 * b07,
        a32 * b02 - a30 * b05 - a33 * b01,
        a20 * b05 - a22 * b02 + a23 * b01,
        a10 * b10 - a11 * b08 + a13 * b06,
        a01 * b08 - a00 * b10 - a03 * b06,
        a30 * b04 - a31 * b02 + a33 * b00,
        a21 * b02 - a20 * b04 - a23 * b00,
        a11 * b07 - a10 * b09 - a12 * b06,
        a00 * b09 - a01 * b07 + a02 * b06,
        a31 * b01 - a30 * b03 - a32 * b00,
        a20 * b03 - a21 * b01 + a22 * b00) / det;
}

struct PointLight {
    vec3 position;
    float distance;
    vec3 color;
};
uniform PointLight pointLights[NUM_POINT_LIGHTS];

varying float intensity1;
varying float intensity2;

const float PI = 3.14159265358979;

void main(void) {
    vec3 cameraDir = normalize(cameraPosition - (modelMatrix * vec4(0., 0., 0., 1.)).xyz);
    vec3 lightDir = normalize((inverse(modelViewMatrix) * vec4(pointLights[0].position, 1.)).xyz);
    vec3 normalVec = (modelMatrix * vec4(normal, 0.)).xyz;
    vec3 halfNormalVec = normalize(normalVec + cameraDir);

    intensity1 = 0.5*dot(lightDir, normalVec + 0.5 * lightDir) * dot(cameraDir + 0.5*lightDir, lightDir) * (1. - pow(dot(cameraDir, normalVec), 1.5));
    intensity2 = 1.5*dot(lightDir, normalVec + lightDir) * (1. - dot(cameraDir + 1.5*lightDir, lightDir)/2.5) * (1. - dot(cameraDir, normalVec));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Atomosphere fragment shader
var atmosphereFS = `
varying float intensity1;
varying float intensity2;

uniform vec3 atmosphereColor;
uniform vec3 sunsetColor;
uniform float atmosphereStrength;
uniform float sunsetStrength;

void main(void) {
    gl_FragColor = vec4(atmosphereStrength * intensity1 * atmosphereColor
        + sunsetStrength * intensity2 * sunsetColor, intensity1 + intensity2);
}
`;

var haloVS = `
varying float intensity;
const float PI = 3.14159265358979;

void main(void) {
    // Vertex position in world coordinate
    vec4 vertexPos = modelMatrix * vec4(position, 1.0);
    vec3 vertexPos3 = vertexPos.xyz/vertexPos.w;
    // Light direction in world coordinate
    // Normal vector in world coordinate
    // Model view position of the vertex
    vec4 modelViewPos = modelViewMatrix * vec4(position, 1.0);
    float distance = length(cameraPosition);
    // Camera
    vec4 centerPos4 = modelMatrix * vec4(0., 0., 0., 1.);
    vec3 centerPos3 = (centerPos4/centerPos4.w).xyz;
    vec3 cameraRelative = cameraPosition - centerPos3;

    vec3 cameraDir = normalize(cameraRelative);
    vec3 normalVec = (modelMatrix * vec4(normal, 0.)).xyz;
// pow(dot(normalVec, cameraDir), 4.) * 
    intensity = pow(dot(normalVec, cameraDir), 4.) * min(distance / 2000., 1.);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Atomosphere fragment shader
var haloFS = `
varying float intensity;
uniform vec3 color;

void main(void) {
    gl_FragColor = vec4(intensity * color, intensity);
}
`;
