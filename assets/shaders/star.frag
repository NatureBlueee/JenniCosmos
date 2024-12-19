varying vec3 vColor;

void main() {
    // 计算到中心的距离
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // 创建柔和的圆形
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    
    // 添加光晕效果
    float glow = exp(-2.0 * dist);
    vec3 finalColor = vColor + glow * 0.5;
    
    gl_FragColor = vec4(finalColor, alpha);
} 