uniform float time;
uniform float pixelRatio;
uniform vec3 wind;
attribute float size;
attribute vec3 initialPosition;
attribute float speed;
varying vec3 vColor;

void main() {
    // 计算雪花的运动
    vec3 pos = initialPosition;
    float t = time * speed;
    
    // 添加风的影响
    pos.x += wind.x * t;
    pos.y = mod(pos.y - t * 10.0 + wind.y * t, 200.0) - 100.0;
    pos.z += wind.z * t;
    
    // 添加螺旋运动
    float spiral = sin(t * 2.0) * 2.0;
    pos.x += spiral * cos(t);
    pos.z += spiral * sin(t);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // 添加深度感
    float depth = 1.0 - (-mvPosition.z / 200.0);
    
    // 设置点大小，考虑风的影响
    float windEffect = length(wind.xz) * 0.5;
    gl_PointSize = size * pixelRatio * depth * (1.0 - windEffect * 0.3);
    gl_Position = projectionMatrix * mvPosition;
    
    // 传递颜色到片段着色器，添加深度变化
    float brightness = 0.7 + 0.3 * sin(time + initialPosition.x + initialPosition.y);
    vColor = vec3(brightness);
} 