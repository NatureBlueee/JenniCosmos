import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
// 场景配置
const config = {
  scene: {
    camera: {
      fov: 60,
      near: 0.1,
      far: 3000,
      position: { x: 0, y: 0, z: 1500 },
      movement: {
        rotationSpeed: 0.3,
        positionSpeed: 0.4,
        zoomSpeed: 0.5,
        autoRotate: true,
        autoRotateSpeed: 0.01,
      },
    },
    background: new THREE.Color(0x000814),
  },
  starfield: {
    layers: [
      {
        count: 3000,
        size: { min: 1.2, max: 2.5 },
        distance: 1000,
        color: new THREE.Color(0xffffff),
        rotationSpeed: 0.02,
        opacity: { min: 0.4, max: 0.8 },
      },
      {
        count: 5000,
        size: { min: 0.8, max: 1.5 },
        distance: 1800,
        color: new THREE.Color(0xb0c4de),
        rotationSpeed: 0.015,
        opacity: { min: 0.3, max: 0.6 },
      },
      {
        count: 8000,
        size: { min: 0.4, max: 0.8 },
        distance: 2500,
        color: new THREE.Color(0x87ceeb),
        rotationSpeed: 0.01,
        opacity: { min: 0.2, max: 0.5 },
      },
    ],
    colors: {
      variants: [
        new THREE.Color(0xffffff), // 纯白
        new THREE.Color(0xffd700), // 金色
        new THREE.Color(0x87ceeb), // 天蓝
        new THREE.Color(0xff69b4), // 粉红
        new THREE.Color(0x32cd32), // 青绿
      ],
    },
  },
  meteor: {
    count: 5,
    minSpeed: 0.15,
    maxSpeed: 0.3,
    minSize: 0.3,
    maxSize: 0.6,
    color: new THREE.Color(0xffffff).multiplyScalar(0.8),
    trailColor: new THREE.Color(0x4169e1).multiplyScalar(0.6),
    trailLength: 0.75,
    spawnInterval: { min: 4, max: 8 },
  },
};

// 1. 首先定义 Meteor 类
class Meteor {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.initialize();
  }

  initialize() {
    // 初始化流星的属性
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.trail = [];
    this.isActive = true;

    // 设置初始位置和方向
    this.resetPosition();
  }

  resetPosition() {
    // 随机生成流星的起始位置
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = this.config.meteor.spawnRadius || 1000;

    this.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );

    // 设置速度方向
    this.velocity
      .copy(this.position)
      .normalize()
      .multiplyScalar(
        -THREE.MathUtils.randFloat(
          this.config.meteor.minSpeed,
          this.config.meteor.maxSpeed
        )
      );
  }

  update(deltaTime) {
    if (!this.isActive) return true;

    // 更新位置
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // 更新拖尾效果
    this.updateTrail();

    // 检查是否超出边界
    if (this.position.length() < 100) {
      this.isActive = false;
      return true;
    }

    return false;
  }

  updateTrail() {
    // 实现拖尾效果的逻辑
    // ...
  }
}

// 2. 然后定义 MeteorSystem 类
class MeteorSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.meteors = [];
    this.lastSpawnTime = Date.now();
    this.nextSpawnInterval = this.getRandomInterval();
    this.isActive = true;
  }

  getRandomInterval() {
    const { min, max } = this.config.meteor.spawnInterval;
    return (Math.random() * (max - min) + min) * 1000;
  }

  update(deltaTime) {
    if (!this.isActive) return;

    // 更新现有流星
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      if (this.meteors[i].update(deltaTime)) {
        this.meteors.splice(i, 1);
      }
    }

    // 检查是否需要生成新流星
    const currentTime = Date.now();
    if (
      currentTime - this.lastSpawnTime > this.nextSpawnInterval &&
      this.meteors.length < this.config.meteor.count
    ) {
      this.spawnMeteor();
      this.lastSpawnTime = currentTime;
      this.nextSpawnInterval = this.getRandomInterval();
    }
  }

  spawnMeteor() {
    const meteor = new Meteor(this.scene, this.config);
    this.meteors.push(meteor);
  }
}

class SceneManager {
  constructor() {
    // 保存全局配置
    this.config = config;

    // 调整3D噪声配置
    this.noise = {
      time: 0,
      simplex: createNoise2D(),
      flow: {
        speed: 0.04,
        scale: 0.02,
        octaves: 2.5,
        persistence: 0.35,
        lacunarity: 1.5,
        zScale: 0.2,
      },
    };

    // 调整鼠标状态
    this.mouseState = {
      position: new THREE.Vector2(0, 0),
      target: new THREE.Vector2(0, 0),
      damping: 0.012,
      flowOffset: new THREE.Vector3(0, 0, 0),
      sensitivity: {
        rotation: 0.0001,
        parallax: 0.05,
        flow: 0.18,
        depth: 0.045,
      },
    };

    // 首先初始化性能监控
    this.initializePerformanceMonitoring();
    console.log("Performance monitoring initialized");

    // 保存全局配置
    this.config = config; // 使用外部定义的 config

    // 初始化配置
    this.initializeConfigs();
    console.log("Configurations initialized");

    // 基础场景设置
    this.setupScene();
    console.log("Scene created");

    // 相机设置
    this.setupCamera();
    console.log("Camera initialized");

    // 渲染器设置
    this.setupRenderer();
    console.log("Renderer setup complete");

    // 初始化宇宙效果
    this.initializeCosmicEffects();
    console.log("Cosmic effects initialized");

    // 设置星空
    this.createStarfield();
    console.log("Stars setup complete");

    // 初始化流星
    this.initializeMeteors();
    console.log("Meteors initialized");

    // 绑定事件
    this.bindEvents();
    console.log("Event listeners bound");

    // 定义动画方法
    this.animate = this.animate.bind(this);

    // 开始动画循环
    this.animate();

    // 扩展星空配置
    this.starfieldConfig = {
      // 基础星星
      stars: {
        count: 15000,
        layers: [
          {
            count: 5000,
            size: { min: 0.1, max: 0.3 },
            color: new THREE.Color(0xffffff),
            distance: { min: 800, max: 1200 },
            brightness: { min: 0.5, max: 1.0 },
            pulseSpeed: { min: 0.5, max: 1.5 },
          },
          {
            count: 7000,
            size: { min: 0.05, max: 0.15 },
            color: new THREE.Color(0xb0c4de),
            distance: { min: 1200, max: 1800 },
            brightness: { min: 0.3, max: 0.7 },
            pulseSpeed: { min: 0.3, max: 0.8 },
          },
          {
            count: 3000,
            size: { min: 0.15, max: 0.4 },
            color: new THREE.Color(0xffd700),
            distance: { min: 600, max: 1000 },
            brightness: { min: 0.6, max: 1.0 },
            pulseSpeed: { min: 0.8, max: 1.2 },
          },
        ],
        // 星芒效果
        starburst: {
          enabled: true,
          rays: 6,
          scale: { min: 1.2, max: 2.0 },
          intensity: { min: 0.3, max: 0.7 },
        },
      },
      // 星团
      clusters: {
        count: 5,
        size: { min: 100, max: 300 },
        density: { min: 50, max: 200 },
        color: new THREE.Color(0xe6e6fa),
        opacity: { min: 0.2, max: 0.4 },
      },
      // 星云
      nebulae: {
        count: 3,
        size: { min: 500, max: 1000 },
        colors: [
          new THREE.Color(0x4b0082).multiplyScalar(0.3), // 深紫色
          new THREE.Color(0x800080).multiplyScalar(0.2), // 紫色
          new THREE.Color(0x4169e1).multiplyScalar(0.25), // 蓝色
        ],
        opacity: { min: 0.1, max: 0.2 },
      },
    };

    this.initializeCosmicEffects = () => {
      // 只保留需要的效果初始化
      this.createStarfield();
      this.createStarClusters();
      // 添加魔法粒子初始化
      this.createMagicalParticles();
    };

    // 扩展星云配置
    this.nebulaConfig = {
      count: 5,
      size: {
        min: 800,
        max: 1500,
      },
      colors: [
        new THREE.Color(0x3366ff).multiplyScalar(0.5), // 蓝色星云
        new THREE.Color(0xff6633).multiplyScalar(0.3), // 橙色星云
        new THREE.Color(0x9933ff).multiplyScalar(0.4), // 紫色星云
        new THREE.Color(0x33ff99).multiplyScalar(0.3), // 青色星云
      ],
      opacity: {
        min: 0.2,
        max: 0.4,
      },
      animation: {
        speed: 0.05,
        turbulence: 0.3,
      },
    };

    // 添加新的星云细节配置
    this.nebulaEnhancement = {
      dustClouds: {
        count: 8,
        size: { min: 200, max: 400 },
        opacity: { min: 0.1, max: 0.2 },
      },
      colorVariation: {
        primary: [
          new THREE.Color(0x3366ff).multiplyScalar(0.5), // 蓝色
          new THREE.Color(0xff6633).multiplyScalar(0.3), // 橙色
          new THREE.Color(0x9933ff).multiplyScalar(0.4), // 紫色
        ],
        secondary: [
          new THREE.Color(0x33ff99).multiplyScalar(0.3), // 青色
          new THREE.Color(0xff3366).multiplyScalar(0.2), // 粉色
          new THREE.Color(0xffff33).multiplyScalar(0.2), // 黄色
        ],
      },
      animation: {
        rotationSpeed: 0.02,
        pulseSpeed: 0.1,
        turbulence: 0.15,
      },
    };

    // 添加魔法粒子配置
    this.magicalParticles = {
      enabled: true,
      particles: [],
      config: {
        count: 50,
        colors: [
          new THREE.Color(0xffd700).multiplyScalar(0.6), // 柔和的金色
          new THREE.Color(0x9400d3).multiplyScalar(0.4), // 柔和的紫色
          new THREE.Color(0x00ffff).multiplyScalar(0.5), // 柔和的青色
        ],
        size: {
          min: 2,
          max: 4,
        },
        speed: {
          min: 0.2,
          max: 0.5,
        },
        trail: {
          length: 20,
          opacity: 0.15,
        },
      },
    };

    // 在所有初始化完成后，添加进度面板
    this.initProgressPanel();
    console.log("Progress panel initialized");
  }

  // 添加进度面板初始化方法
  initProgressPanel() {
    // 创建进度面板容器
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";
    progressContainer.innerHTML = `
      <div class="progress-panel">
        <h2>Jenny's Blog</h2>
        <div class="progress-subtitle">Development Progress</div>
        <div class="progress-items">
          <div class="progress-item">
            <div class="progress-title">Design Phase</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 80%"></div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-title">Core Features</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 65%"></div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-title">Content Creation</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 45%"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .progress-container {
        position: fixed;
        left: 2rem;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1000;
        opacity: 0;
        animation: fadeIn 1.5s ease-out forwards;
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(-50%) translateX(-30px); }
        100% { opacity: 1; transform: translateY(-50%) translateX(0); }
      }
      
      .progress-panel {
        position: relative;
        background: rgba(13, 13, 13, 0.45);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        padding: 2.5rem;
        color: white;
        font-family: 'Space Mono', monospace;
        min-width: 320px;
        overflow: hidden;
      }

      /* 添加微光边框效果 */
      .progress-panel::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 16px;
        padding: 1px;
        background: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.05) 50%,
          rgba(255, 255, 255, 0.15)
        );
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }

      /* 添加星尘效果 */
      .progress-panel::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        right: -50%;
        bottom: -50%;
        background: radial-gradient(
          circle at center,
          rgba(255, 255, 255, 0.03) 0%,
          transparent 70%
        );
        opacity: 0.5;
        animation: starDust 20s linear infinite;
      }

      @keyframes starDust {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .panel-content {
        position: relative;
        z-index: 1;
      }

      .progress-panel h2 {
        font-size: 1.8rem;
        margin: 0 0 0.5rem 0;
        font-weight: 500;
        background: linear-gradient(45deg, #fff, #64b5f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.1));
        letter-spacing: 0.02em;
      }

      .progress-subtitle {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.5);
        margin-bottom: 2.5rem;
        letter-spacing: 0.08em;
        font-weight: 300;
      }

      .progress-items {
        display: flex;
        flex-direction: column;
        gap: 1.8rem;
      }

      .progress-item {
        opacity: 0;
        animation: slideIn 0.8s ease-out forwards;
      }

      @keyframes slideIn {
        0% { opacity: 0; transform: translateX(-15px); }
        100% { opacity: 1; transform: translateX(0); }
      }

      .progress-item:nth-child(1) { animation-delay: 0.3s; }
      .progress-item:nth-child(2) { animation-delay: 0.5s; }
      .progress-item:nth-child(3) { animation-delay: 0.7s; }

      .progress-title {
        font-size: 0.9rem;
        margin-bottom: 0.8rem;
        color: rgba(255, 255, 255, 0.75);
        font-weight: 300;
        letter-spacing: 0.04em;
      }

      .progress-bar {
        height: 3px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 3px;
        overflow: hidden;
        position: relative;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, 
          rgba(100, 181, 246, 0.8),
          rgba(33, 150, 243, 0.9)
        );
        box-shadow: 0 0 20px rgba(33, 150, 243, 0.2);
        border-radius: 3px;
        width: 0;
        animation: fillProgress 2s ease-out forwards;
        position: relative;
      }

      /* 添加流光效果 */
      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transform: translateX(-100%);
        animation: shimmer 2s infinite;
      }

      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }

      @keyframes fillProgress {
        0% { width: 0; }
        100% { width: var(--progress-width); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(progressContainer);

    // 延迟设置进度条宽度以触发动画
    setTimeout(() => {
      const fills = document.querySelectorAll(".progress-fill");
      fills.forEach((fill) => {
        const width = fill.style.width;
        fill.style.setProperty("--progress-width", width);
        fill.style.width = "0";
      });
    }, 100);
  }

  // 新增魔法粒子创建方法
  createMagicalParticles() {
    const { config } = this.magicalParticles;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const speeds = [];

    // 创建粒子
    for (let i = 0; i < config.count; i++) {
      // 随机位置
      positions.push(
        THREE.MathUtils.randFloatSpread(2000), // x
        THREE.MathUtils.randFloatSpread(2000), // y
        THREE.MathUtils.randFloatSpread(1000) // z
      );

      // 随机颜色
      const color =
        config.colors[Math.floor(Math.random() * config.colors.length)];
      colors.push(color.r, color.g, color.b);

      // 随机大小
      sizes.push(THREE.MathUtils.randFloat(config.size.min, config.size.max));

      // 随机速度
      speeds.push(
        THREE.MathUtils.randFloat(config.speed.min, config.speed.max)
      );
    }

    // 设置属性
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute("speed", new THREE.Float32BufferAttribute(speeds, 1));

    // 创建着色器材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: this.getMagicalParticleVertexShader(),
      fragmentShader: this.getMagicalParticleFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 创建粒子系统
    const particles = new THREE.Points(geometry, material);
    this.magicalParticles.particles.push(particles);
    this.scene.add(particles);
  }

  // 魔法粒子顶点着色器
  getMagicalParticleVertexShader() {
    return `
      uniform float time;
      uniform float pixelRatio;
      attribute float size;
      attribute float speed;
      attribute vec3 color;
      varying vec3 vColor;
      
      void main() {
        vColor = color;
        
        // 添加魔法般的运动
        vec3 pos = position;
        float moveTime = time * speed;
        
        // 创建螺旋运动
        float angle = moveTime * 0.5;
        float radius = 50.0 * sin(moveTime * 0.2);
        pos.x += cos(angle) * radius;
        pos.y += sin(angle) * radius;
        pos.z += sin(moveTime * 0.3) * 30.0;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // 添加大小变化
        float scale = sin(moveTime) * 0.2 + 0.8;
        gl_PointSize = size * pixelRatio * scale * (300.0 / -mvPosition.z);
      }
    `;
  }

  // 魔法粒子片段着色器
  getMagicalParticleFragmentShader() {
    return `
      varying vec3 vColor;
      
      void main() {
        // 创建柔和的光晕效果
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        // 基础光晕
        float strength = 1.0 - smoothstep(0.0, 0.5, dist);
        
        // 添加内部光芒
        float innerGlow = smoothstep(0.4, 0.0, dist);
        
        // 组合效果
        vec3 finalColor = vColor * strength + vColor * innerGlow * 0.5;
        float alpha = strength;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;
  }

  // 更新魔法粒子
  updateMagicalParticles(deltaTime) {
    // 添加安全检查
    if (!this.magicalParticles || !this.magicalParticles.enabled) return;

    this.magicalParticles.particles.forEach((particles) => {
      if (particles.material && particles.material.uniforms) {
        particles.material.uniforms.time.value += deltaTime;
      }
    });
  }

  // 添加 animate 方法
  animate() {
    if (!this.animationState.isAnimating) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(
      (currentTime - this.animationState.lastUpdateTime) / 1000,
      0.1
    );
    this.animationState.lastUpdateTime = currentTime;

    // 更新性能统计
    this.updatePerformanceStats(deltaTime);

    // 更新场景
    this.updateScene(deltaTime);

    // 确保在渲染前检查必要组件
    if (this.scene && this.camera && this.renderer) {
      // 添加调试信息
      if (this.debug.logUpdates && this.stats.frames % 300 === 0) {
        console.log("Rendering frame with:", {
          cameraPosition: this.camera.position.toArray(),
          sceneChildren: this.scene.children.map((child) => ({
            type: child.type,
            position: child.position.toArray(),
          })),
        });
      }

      this.renderer.render(this.scene, this.camera);
    }

    // 添加魔法粒子更新
    this.updateMagicalParticles(deltaTime);

    requestAnimationFrame(this.animate.bind(this));
  }

  updatePerformanceStats(deltaTime) {
    // 添加调试输出
    if (this.debug.logUpdates && this.stats.frames % 60 === 0) {
      console.log({
        fps: this.stats.fps,
        frameTime: this.stats.frameTime,
        objects: this.scene ? this.scene.children.length : 0,
        drawCalls: this.renderer ? this.renderer.info.render.calls : 0,
      });
    }

    if (!this.stats || !this.debug) return;

    // 更新FPS计数
    this.stats.frames++;
    const timeSinceLastUpdate = performance.now() - this.stats.lastUpdate;

    if (timeSinceLastUpdate >= this.stats.updateInterval) {
      this.stats.fps = (this.stats.frames * 1000) / timeSinceLastUpdate;
      this.stats.frameTime = timeSinceLastUpdate / this.stats.frames;
      this.stats.frames = 0;
      this.stats.lastUpdate = performance.now();

      // 更新性能面板（如果存在）
      if (this.debug.showPerformance) {
        this.updatePerformancePanel();
      }
    }
  }

  updateScene(deltaTime) {
    // 添加错误检查
    if (!this.scene || !this.config) {
      console.warn("Scene or config not initialized");
      return;
    }

    // 更新流星系统
    if (this.meteorSystem) {
      this.meteorSystem.update(deltaTime);
    }

    // 更新星云
    if (this.nebulae) {
      this.nebulae.forEach((nebula) => {
        if (nebula.material.uniforms.time) {
          nebula.material.uniforms.time.value += deltaTime;
        }
      });
    }

    // 更新相机
    this.updateCamera(deltaTime);

    // 更新星空
    if (this.starfield && this.starfield.material.uniforms) {
      this.starfield.material.uniforms.time.value += deltaTime * 0.1; // 降低闪烁速度
    }
  }

  renderScene() {
    if (!this.scene || !this.camera || !this.renderer) {
      console.warn("Essential rendering components not initialized");
      return;
    }

    try {
      // 执行渲染
      this.renderer.render(this.scene, this.camera);

      // 更新渲染统计
      if (this.debug && this.debug.showPerformance) {
        const info = this.renderer.info;
        this.debug.metrics = {
          drawCalls: info.render.calls,
          triangles: info.render.triangles,
          points: info.render.points,
          lines: info.render.lines,
          textures: info.memory ? info.memory.textures : 0,
          geometries: info.memory ? info.memory.geometries : 0,
          materials: info.programs ? info.programs.length : 0,
        };

        // 性能警告检查
        this.checkPerformanceThresholds();
      }
    } catch (error) {
      console.error("Render error:", error);
    }
  }

  checkPerformanceThresholds() {
    const { metrics, thresholds } = this.debug;

    if (this.stats.fps < thresholds.fps) {
      console.warn(`Low FPS: ${this.stats.fps.toFixed(1)}`);
    }

    if (metrics.drawCalls > thresholds.drawCalls) {
      console.warn(`High draw calls: ${metrics.drawCalls}`);
    }

    if (metrics.triangles > thresholds.triangles) {
      console.warn(`High triangle count: ${metrics.triangles}`);
    }
  }

  updatePerformancePanel() {
    const panel = document.getElementById("performance-panel");
    if (!panel) return;

    const { fps, frameTime } = this.stats;
    const { drawCalls, triangles, points, lines } = this.debug.metrics;

    panel.innerHTML = `
      <div>FPS: ${fps.toFixed(1)}</div>
      <div>Frame Time: ${frameTime.toFixed(1)}ms</div>
      <div>Draw Calls: ${drawCalls}</div>
      <div>Triangles: ${triangles}</div>
      <div>Points: ${points}</div>
      <div>Lines: ${lines}</div>
    `;
  }

  initializePerformanceMonitoring() {
    // 初始化性能监控状态
    this.stats = {
      fps: 0,
      frameTime: 0,
      lastTime: performance.now(),
      frames: 0,
      updateInterval: 1000,
      lastUpdate: performance.now(),
    };

    // 初始化调试配置
    this.debug = {
      showPerformance: true,
      logUpdates: true,
      logInterval: 1000, // 日志输出间隔（毫秒）
      metrics: {
        drawCalls: 0,
        triangles: 0,
        points: 0,
        lines: 0,
        textures: 0,
        geometries: 0,
        materials: 0,
      },
      thresholds: {
        fps: 30,
        drawCalls: 1000,
        triangles: 100000,
      },
    };

    // 初始化动画状态
    this.animationState = {
      isAnimating: true,
      lastUpdateTime: performance.now(),
      deltaTime: 0,
      elapsedTime: 0,
    };

    console.log("Performance monitoring initialized");
  }

  initializeConfigs() {
    // 宇宙效果配置 - 使用现有的配置结构
    this.cosmicConfig = {
      nebulae: {
        count: 12,
        minRadius: 800,
        maxRadius: 2000,
        minOpacity: 0.2,
        maxOpacity: 0.4,
        colors: [
          new THREE.Color(0x3366ff).multiplyScalar(0.5),
          new THREE.Color(0xff6633).multiplyScalar(0.3),
          new THREE.Color(0x9933ff).multiplyScalar(0.4),
          new THREE.Color(0x33ff99).multiplyScalar(0.3),
        ],
      },
      volumetricLight: {
        count: 8,
        minSize: 500,
        maxSize: 1200,
        minIntensity: 0.1,
        maxIntensity: 0.3,
        colors: [
          new THREE.Color(0xffffff).multiplyScalar(0.4),
          new THREE.Color(0x4477ff).multiplyScalar(0.3),
          new THREE.Color(0xff7744).multiplyScalar(0.3),
        ],
      },
    };

    // 入场动画配置
    this.entranceAnimation = {
      enabled: true,
      duration: 8.0,
      startPosition: new THREE.Vector3(0, -500, 4000),
      targetPosition: new THREE.Vector3(0, 0, 2000),
      easing: (t) => 1 - Math.pow(1 - t, 3),
      progress: 0,
    };

    const ambientConfig = {
      nebulae: [
        {
          color: new THREE.Color(0x4b0082).multiplyScalar(0.3),
          size: 2000,
          opacity: 0.15,
        },
        {
          color: new THREE.Color(0x800080).multiplyScalar(0.2),
          size: 2500,
          opacity: 0.12,
        },
      ],
      volumetricLight: {
        intensity: 0.08,
        decay: 2.0,
        density: 0.15,
      },
    };
  }

  initializeCosmicEffects() {
    // 创建星云
    this.nebulae = [];
    const nebulaConfig = this.cosmicConfig.nebulae;

    for (let i = 0; i < nebulaConfig.count; i++) {
      const size = THREE.MathUtils.randFloat(
        nebulaConfig.minRadius,
        nebulaConfig.maxRadius
      );
      const opacity = THREE.MathUtils.randFloat(
        nebulaConfig.minOpacity,
        nebulaConfig.maxOpacity
      );
      const color =
        nebulaConfig.colors[
          Math.floor(Math.random() * nebulaConfig.colors.length)
        ];

      const nebula = this.createNebula(size, color, opacity);
      this.nebulae.push(nebula);
      this.scene.add(nebula);
    }
  }

  createNebula(size, color, opacity) {
    const geometry = new THREE.PlaneGeometry(size, size, 64, 64); // 增加细分
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: color },
        opacity: { value: opacity },
      },
      vertexShader: this.getNebulaVertexShader(),
      fragmentShader: this.getNebulaFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const nebula = new THREE.Mesh(geometry, material);

    // 添加随机旋转
    nebula.rotation.x = Math.random() * Math.PI;
    nebula.rotation.y = Math.random() * Math.PI;
    nebula.rotation.z = Math.random() * Math.PI;

    return nebula;
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = this.config.scene.background;

    // 创建容器
    this.container = document.getElementById("scene-container");
    if (!this.container) {
      console.warn("Scene container not found, creating one");
      this.container = document.createElement("div");
      this.container.id = "scene-container";
      this.container.style.width = "100vw";
      this.container.style.height = "100vh";
      this.container.style.position = "fixed";
      this.container.style.top = "0";
      this.container.style.left = "0";
      this.container.style.backgroundColor = "#000"; // 添加背景色
      document.body.appendChild(this.container);
    }

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    console.log("Scene container size:", this.width, this.height);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      3000
    );

    // 设置初始相机位置
    this.camera.position.set(0, 0, 1500);
    this.camera.lookAt(0, 0, 0);

    // 初始化相机动画状态
    this.cameraState = {
      // 漂浮运动参数
      drift: {
        enabled: true,
        speed: 0.02,
        amplitude: {
          x: 80,
          y: 60,
          z: 40,
        },
        time: 0,
      },
      // 视角转动参数
      rotation: {
        enabled: true,
        speed: 0.00015, // 非常缓慢的旋转
        time: 0,
      },
    };

    console.log("Camera initialized with drift parameters:", this.cameraState);
  }

  updateCamera(deltaTime) {
    if (!this.camera || !this.cameraState) return;

    const { drift, rotation } = this.cameraState;

    // 更新噪声时间
    this.noise.time += deltaTime * this.noise.flow.speed;

    // 计算基础鼠标位置（带阻尼）
    this.mouseState.position.x +=
      (this.mouseState.target.x - this.mouseState.position.x) *
      this.mouseState.damping;
    this.mouseState.position.y +=
      (this.mouseState.target.y - this.mouseState.position.y) *
      this.mouseState.damping;

    // 计算3D流体效果
    const flow = this.calculateFlowEffect(
      this.mouseState.position.x * 10,
      this.mouseState.position.y * 10,
      this.noise.time
    );

    // 平滑更新流体偏移
    this.mouseState.flowOffset.x +=
      (flow.x - this.mouseState.flowOffset.x) * 0.1;
    this.mouseState.flowOffset.y +=
      (flow.y - this.mouseState.flowOffset.y) * 0.1;
    this.mouseState.flowOffset.z +=
      (flow.z - this.mouseState.flowOffset.z) * 0.1;

    if (drift.enabled) {
      drift.time += deltaTime * drift.speed;

      // 基础漂浮
      const driftX = Math.sin(drift.time * 0.3) * drift.amplitude.x;
      const driftY = Math.cos(drift.time * 0.2) * drift.amplitude.y;
      const driftZ = Math.sin(drift.time * 0.15) * drift.amplitude.z;

      // 应用3D位置
      const mouseInfluenceX =
        (this.mouseState.position.x + this.mouseState.flowOffset.x) * 150;
      const mouseInfluenceY =
        (this.mouseState.position.y + this.mouseState.flowOffset.y) * 150;
      const mouseInfluenceZ = this.mouseState.flowOffset.z * 100; // Z轴影响

      this.camera.position.x = driftX + mouseInfluenceX;
      this.camera.position.y = driftY + mouseInfluenceY;
      this.camera.position.z = 1500 + driftZ + mouseInfluenceZ;

      // 更新注视点以创建更动态的视角
      const lookAtPoint = new THREE.Vector3(
        mouseInfluenceX * 0.3 + this.mouseState.flowOffset.x * 50,
        mouseInfluenceY * 0.3 + this.mouseState.flowOffset.y * 50,
        this.mouseState.flowOffset.z * 30
      );

      if (rotation.enabled) {
        rotation.time += deltaTime;
        lookAtPoint.x += Math.sin(rotation.time * 0.08) * 40;
        lookAtPoint.y += Math.cos(rotation.time * 0.08) * 40;
      }

      this.camera.lookAt(lookAtPoint);
    }

    this.camera.updateProjectionMatrix();
  }

  setupRenderer() {
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    // 设置渲染器尺寸和像素比
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 修复 THREE.js 新版本的颜色空间设置
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    // 确保添加到容器
    if (this.container) {
      this.container.appendChild(this.renderer.domElement);
    }

    // 添加调试信息
    console.log(
      "Renderer canvas size:",
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
    console.log(
      "Container size:",
      this.container.clientWidth,
      this.container.clientHeight
    );
  }

  getNebulaVertexShader() {
    return `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  getNebulaFragmentShader() {
    return `
      uniform vec3 color;
      uniform float opacity;
      uniform float time;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      // 改进的柏林噪声实现
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }
      
      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float dist = length(uv);
        
        // 使用改进的噪声创建更自然的星云形态
        float noise1 = snoise(vec3(vPosition.xy * 0.02, time * 0.1));
        float noise2 = snoise(vec3(vPosition.yx * 0.04, time * 0.15 + 100.0));
        float noise3 = snoise(vec3(vPosition.xy * 0.01, time * 0.05 - 100.0));
        
        // 组合多层噪声
        float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
        
        // 创建星云的基础形状
        float alpha = smoothstep(1.0, 0.0, dist) * opacity;
        
        // 添加动态扭曲效果
        alpha *= 1.0 + combinedNoise * 0.5;
        
        // 添加颜色变化
        vec3 finalColor = color + combinedNoise * 0.2;
        
        // 边缘渐变
        alpha *= smoothstep(1.0, 0.2, dist);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;
  }

  createStarfield() {
    console.log("Creating starfield...");

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const sizes = [];
    const opacities = [];

    // 增加星星数量
    const starCount = 15000;

    for (let i = 0; i < starCount; i++) {
      // 使用球面分布来创建更自然的星空
      const radius = Math.random() * 2000; // 增加分布范围
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      vertices.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      // 随机大小，但保持较小以模拟远处的星星
      const size = THREE.MathUtils.randFloat(0.1, 3.0);
      sizes.push(size);

      // 随机不透明度，使一些星星更亮
      const opacity = THREE.MathUtils.randFloat(0.1, 1.0);
      opacities.push(opacity);

      // 添加一些颜色变化
      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        // 蓝白色星星
        colors.push(0.8, 0.9, 1.0);
      } else if (colorChoice < 0.6) {
        // 纯白色星星
        colors.push(1.0, 1.0, 1.0);
      } else {
        // 黄白色星星
        colors.push(1.0, 0.9, 0.8);
      }
    }

    // 设置属性
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute(
      "opacity",
      new THREE.Float32BufferAttribute(opacities, 1)
    );

    // 创建着色器材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        brightness: { value: 1.0 },
      },
      vertexShader: `
        uniform float time;
        uniform float pixelRatio;
        attribute float size;
        attribute vec3 color;
        attribute float opacity;
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          vColor = color;
          vOpacity = opacity;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // 添加闪烁效果
          float scintillation = sin(time * 2.0 + position.x * 0.25 + position.y * 0.25) * 0.1 + 0.9;
          gl_PointSize = size * pixelRatio * scintillation;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          // 创建圆形点
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          float alpha = smoothstep(0.5, 0.3, dist) * vOpacity;
          
          // 添加光晕效果
          vec3 finalColor = vColor;
          finalColor += vec3(0.2) * (1.0 - dist * 2.0);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // 创建点云系统
    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);

    console.log("Starfield created with", starCount, "stars");
  }

  initializeMeteors() {
    // 现在可以正确引用 MeteorSystem 类
    this.meteorSystem = new MeteorSystem(this.scene, config);

    this.meteorConfig = {
      maxMeteors: config.meteor.count,
      spawnInterval: {
        min: config.meteor.spawnInterval.min * 1000,
        max: config.meteor.spawnInterval.max * 1000,
      },
      speed: {
        min: config.meteor.minSpeed,
        max: config.meteor.maxSpeed,
      },
      size: {
        min: config.meteor.minSize,
        max: config.meteor.maxSize,
      },
      color: config.meteor.color,
      trailColor: config.meteor.trailColor,
      trailLength: config.meteor.trailLength,
    };
  }

  bindEvents() {
    // 处理窗口大小变化
    window.addEventListener("resize", this.handleResize.bind(this));

    // 添加鼠标移动事件
    window.addEventListener("mousemove", this.handleMouseMove.bind(this));

    // 添加触摸事件支持
    window.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove({
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
      },
      { passive: false }
    );

    // 处理可见性变化
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });

    console.log("Event listeners bound");
  }

  handleResize() {
    if (!this.container || !this.camera || !this.renderer) return;

    // 更新容器尺寸
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    // 更新相机
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    // 更新渲染器
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  pause() {
    this.animationState.isAnimating = false;
    console.log("Animation paused");
  }

  resume() {
    if (!this.animationState.isAnimating) {
      this.animationState.isAnimating = true;
      this.animationState.lastUpdateTime = performance.now();
      this.animate();
      console.log("Animation resumed");
    }
  }

  setupPerformanceMonitoring() {
    // 创建性能监控面板
    const performancePanel = document.createElement("div");
    performancePanel.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
    `;
    document.body.appendChild(performancePanel);

    // 更新性能数据
    setInterval(() => {
      if (!this.debug.showPerformance) return;

      const { fps, frameTime } = this.stats;
      performancePanel.textContent = `
        FPS: ${fps.toFixed(1)}
        Frame Time: ${frameTime.toFixed(1)}ms
        Objects: ${this.scene.children.length}
        Draw Calls: ${this.renderer.info.render.calls}
      `;
    }, this.debug.logInterval);
  }

  handleMouseMove(event) {
    if (!this.mouseState) return;

    // 将鼠标位置归一化到 -1 到 1 的范围
    this.mouseState.target.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseState.target.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  // 添加调试方法
  addDebugUI() {
    if (!this.debug.enabled) return;

    const debugContainer = document.createElement("div");
    debugContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
    `;

    const updateDebug = () => {
      debugContainer.textContent = `
        Mouse: ${this.mouseState.position.x.toFixed(2)}, ${this.mouseState.position.y.toFixed(2)}
        Camera: ${this.camera.position.x.toFixed(0)}, ${this.camera.position.y.toFixed(0)}, ${this.camera.position.z.toFixed(0)}
        FPS: ${this.stats.fps.toFixed(1)}
      `;
    };

    setInterval(updateDebug, 100);
    document.body.appendChild(debugContainer);
  }

  // 修改为3D流体效果计算
  calculateFlowEffect(x, y, time) {
    const { flow } = this.noise;
    let amplitude = 1;
    let frequency = 1;
    let noiseValue = {
      x: 0,
      y: 0,
      z: 0,
    };

    // 为每个维度计算独立的噪声值
    for (let i = 0; i < flow.octaves; i++) {
      const sampleX = x * frequency * flow.scale + time;
      const sampleY = y * frequency * flow.scale + time;
      const sampleZ =
        (x + y) * frequency * flow.scale * flow.zScale + time * 0.7;

      // 使用不同的相位偏移来创建独立的运动
      noiseValue.x += this.noise.simplex(sampleX, sampleY + 1000) * amplitude;
      noiseValue.y += this.noise.simplex(sampleX + 1000, sampleY) * amplitude;
      noiseValue.z +=
        this.noise.simplex(sampleX + 2000, sampleY + 2000) *
        amplitude *
        flow.zScale;

      amplitude *= flow.persistence;
      frequency *= flow.lacunarity;
    }

    return noiseValue;
  }

  // 更新星星着色器
  getStarVertexShader() {
    return `
      uniform float time;
      uniform float pixelRatio;
      
      attribute float size;
      attribute vec3 color;
      attribute float brightness;
      attribute float pulseSpeed;
      attribute float starburstScale;
      
      varying vec3 vColor;
      varying float vBrightness;
      varying float vStarburstScale;
      
      void main() {
        vColor = color;
        
        // 计算脉冲效果
        float pulse = sin(time * pulseSpeed) * 0.1 + 0.9;
        vBrightness = brightness * pulse;
        vStarburstScale = starburstScale;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // 应用大小和脉冲
        gl_PointSize = size * pixelRatio * pulse;
      }
    `;
  }

  getStarFragmentShader() {
    return `
      uniform float time;
      
      varying vec3 vColor;
      varying float vBrightness;
      varying float vStarburstScale;
      
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        // 基础星星形状
        float alpha = smoothstep(0.5, 0.3, dist);
        
        // 星芒效果
        float rays = 0.0;
        float numRays = 6.0;
        for(float i = 0.0; i < numRays; i++) {
          float angle = i * 3.14159 * 2.0 / numRays;
          vec2 dir = vec2(cos(angle), sin(angle));
          rays += smoothstep(0.3, 0.0, abs(dot(normalize(center), dir))) * 0.3;
        }
        
        // 组合效果
        vec3 finalColor = vColor * (vBrightness + rays * vStarburstScale);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;
  }

  createStarClusters() {
    const { clusters } = this.starfieldConfig;

    // 创建星团材质
    const clusterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: clusters.color },
        opacity: { value: 0.3 },
        scale: { value: 1.0 },
      },
      vertexShader: this.getClusterVertexShader(),
      fragmentShader: this.getClusterFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 为每个星团创建几何体和网格
    for (let i = 0; i < clusters.count; i++) {
      const size = THREE.MathUtils.randFloat(
        clusters.size.min,
        clusters.size.max
      );
      const density = Math.floor(
        THREE.MathUtils.randFloat(clusters.density.min, clusters.density.max)
      );

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(density * 3);
      const scales = new Float32Array(density);
      const opacities = new Float32Array(density);

      // 生成星团中的星星
      for (let j = 0; j < density; j++) {
        // 使用高斯分布创建更自然的星团形状
        const radius =
          THREE.MathUtils.randFloat(0, size) * Math.pow(Math.random(), 2);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[j * 3 + 2] = radius * Math.cos(phi);

        scales[j] = THREE.MathUtils.randFloat(0.5, 2.0);
        opacities[j] = THREE.MathUtils.randFloat(
          clusters.opacity.min,
          clusters.opacity.max
        );
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));
      geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));

      const cluster = new THREE.Points(geometry, clusterMaterial.clone());

      // 随机位置和旋转
      cluster.position.setFromSpherical(
        new THREE.Spherical(
          THREE.MathUtils.randFloat(1000, 2000),
          Math.random() * Math.PI,
          Math.random() * Math.PI * 2
        )
      );

      cluster.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      this.scene.add(cluster);
      this.starClusters.push({
        mesh: cluster,
        rotationSpeed: THREE.MathUtils.randFloat(0.0001, 0.0003),
        initialRotation: cluster.rotation.clone(),
      });
    }
  }

  // 星团顶点着色器
  getClusterVertexShader() {
    return `
      uniform float time;
      uniform float scale;
      
      attribute float opacity;
      
      varying float vOpacity;
      
      void main() {
        vOpacity = opacity;
        
        // 添加微小的波动效果
        vec3 pos = position;
        float wave = sin(time * 0.5 + length(position) * 0.02) * 0.1;
        pos += normalize(position) * wave;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // 根据距离调整点大小
        float size = scale * (1.5 - length(mvPosition.xyz) * 0.0001);
        gl_PointSize = size * (300.0 / -mvPosition.z);
      }
    `;
  }

  // 星团片段着色器
  getClusterFragmentShader() {
    return `
      uniform vec3 color;
      uniform float time;
      
      varying float vOpacity;
      
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        // 创建柔和的光晕效果
        float alpha = smoothstep(0.5, 0.0, dist) * vOpacity;
        
        // 添加微弱的闪烁效果
        float twinkle = sin(time * 2.0 + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1) * 0.1 + 0.9;
        
        gl_FragColor = vec4(color * twinkle, alpha);
      }
    `;
  }

  // 更新星团动画
  updateStarClusters(deltaTime) {
    this.starClusters.forEach((cluster) => {
      // 更新旋转
      cluster.mesh.rotation.x =
        cluster.initialRotation.x + this.time * cluster.rotationSpeed;
      cluster.mesh.rotation.y =
        cluster.initialRotation.y + this.time * cluster.rotationSpeed * 0.8;

      // 更新着色器 uniforms
      if (cluster.mesh.material.uniforms) {
        cluster.mesh.material.uniforms.time.value = this.time;
      }
    });
  }

  // 添加新的星云细节着色器
  getNebulaDustShader() {
    return `
      uniform vec3 color;
      uniform float opacity;
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;

      // 保持现有的噪声函数...

      float fbm(vec3 x) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100);
        for (int i = 0; i < 4; ++i) {
          v += a * snoise(x);
          x = x * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float dist = length(uv);
        
        // 创建复杂的尘埃云结构
        float noise = fbm(vec3(vPosition.xy * 0.02, time * 0.1));
        float noise2 = fbm(vec3(vPosition.yx * 0.03, time * 0.15 + 10.0));
        
        // 添加旋涡效果
        float angle = atan(uv.y, uv.x);
        float spiral = sin(angle * 3.0 + time * 0.2) * 0.5 + 0.5;
        
        // 组合效果
        float alpha = smoothstep(1.0, 0.0, dist) * opacity;
        alpha *= 1.0 + noise * 0.5 + noise2 * 0.3 + spiral * 0.2;
        
        // 颜色变化
        vec3 finalColor = color;
        finalColor += noise * 0.2 + spiral * 0.1;
        finalColor *= 1.0 + sin(time * 0.5) * 0.1; // 添加脉冲效果
        
        // 边缘处理
        alpha *= smoothstep(1.0, 0.2, dist);
        alpha *= 1.0 - pow(dist, 3.0); // 更柔和的边缘衰减
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;
  }

  createNebulaDust() {
    const { dustClouds } = this.nebulaEnhancement;

    for (let i = 0; i < dustClouds.count; i++) {
      const size = THREE.MathUtils.randFloat(
        dustClouds.size.min,
        dustClouds.size.max
      );
      const opacity = THREE.MathUtils.randFloat(
        dustClouds.opacity.min,
        dustClouds.opacity.max
      );

      // 随机选择颜色
      const colorSet = Math.random() > 0.5 ? "primary" : "secondary";
      const colors = this.nebulaEnhancement.colorVariation[colorSet];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const geometry = new THREE.PlaneGeometry(size, size, 64, 64);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: color },
          opacity: { value: opacity },
        },
        vertexShader: this.getNebulaVertexShader(),
        fragmentShader: this.getNebulaDustShader(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const dust = new THREE.Mesh(geometry, material);

      // 随机位置和旋转
      dust.position.set(
        THREE.MathUtils.randFloatSpread(1000),
        THREE.MathUtils.randFloatSpread(1000),
        THREE.MathUtils.randFloatSpread(500)
      );

      dust.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      this.scene.add(dust);
      this.nebulaDust.push({
        mesh: dust,
        rotationSpeed: THREE.MathUtils.randFloat(0.001, 0.003),
        initialRotation: dust.rotation.clone(),
      });
    }
  }

  // 更新星云尘埃动画
  updateNebulaDust(deltaTime) {
    this.nebulaDust.forEach((dust) => {
      // 更新旋转
      dust.mesh.rotation.x =
        dust.initialRotation.x + this.time * dust.rotationSpeed;
      dust.mesh.rotation.y =
        dust.initialRotation.y + this.time * dust.rotationSpeed * 0.8;

      // 更新着色器时间
      if (dust.mesh.material.uniforms) {
        dust.mesh.material.uniforms.time.value = this.time;
      }
    });
  }
}

// 等待 DOM 加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing SceneManager...");
  const manager = new SceneManager();
});

// 等待 DOM 加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing SceneManager...");
  const manager = new SceneManager();
});
