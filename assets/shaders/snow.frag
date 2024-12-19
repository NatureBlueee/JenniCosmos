varying vec3 vColor;

void main() {
    // 计算到中心的距离
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // 创建雪花形状
    float angle = atan(center.y, center.x);
    float radius = 0.4;
    float flake = radius * (0.8 + 0.2 * sin(6.0 * angle));
    
    // 创建柔和的边缘
    float alpha = smoothstep(flake + 0.1, flake - 0.1, dist);
    
    // 添加晶莹效果
    float sparkle = pow(1.0 - dist, 3.0);
    vec3 finalColor = vColor + sparkle * 0.5;
    
    // 添加光晕效果
    float glow = exp(-2.0 * dist);
    finalColor += glow * 0.2;
    
    gl_FragColor = vec4(finalColor, alpha * 0.7);
    
    // 丢弃太远的片段
    if (alpha < 0.1) discard;
} 