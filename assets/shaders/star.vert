uniform float time;
uniform float pixelRatio;
attribute float size;
attribute vec3 color;
varying vec3 vColor;

void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // 添加呼吸效果
    float brightness = 0.7 + 0.3 * sin(time * 0.5 + position.x * 0.5 + position.y * 0.5);
    
    // 添加深度感
    float depth = 1.0 - (-mvPosition.z / 200.0);
    
    gl_PointSize = size * pixelRatio * brightness * depth;
    gl_Position = projectionMatrix * mvPosition;
} 