import * as THREE from "three";

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
    count: 15000,
    layers: [
      {
        distance: 800,
        size: { min: 0.8, max: 2.0 },
        count: 5000,
        concentration: 0.7,
      },
      {
        distance: 1500,
        size: { min: 0.6, max: 1.5 },
        count: 6000,
        concentration: 0.5,
      },
      {
        distance: 2500,
        size: { min: 0.3, max: 1.0 },
        count: 4000,
        concentration: 0.3,
      },
    ],
    colors: {
      base: new THREE.Color(0x6b8cce),
      highlight: new THREE.Color(0xd6e4ff),
      variants: [
        new THREE.Color(0xffffff).multiplyScalar(1.5),
        new THREE.Color(0xadd8e6).multiplyScalar(1.2),
        new THREE.Color(0x87ceeb).multiplyScalar(1.2),
        new THREE.Color(0xe6e6fa).multiplyScalar(1.2),
        new THREE.Color(0xb0c4de).multiplyScalar(1.2),
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
    // 首先初始化性能监控
    this.initializePerformanceMonitoring();
    console.log("Initializing SceneManager...");

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
  }

  // 添加 animate 方法
  animate() {
    if (!this.animationState.isAnimating) return;

    // 计算帧率和增量时间
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.animationState.lastUpdateTime) / 1000;
    this.animationState.lastUpdateTime = currentTime;

    // 更新性能统计
    this.updatePerformanceStats(deltaTime);

    // 更新场景中的所有动态元素
    this.updateScene(deltaTime);

    // 渲染场景
    this.renderScene();

    // 请求下一帧
    requestAnimationFrame(this.animate);
  }

  updatePerformanceStats(deltaTime) {
    // 更新FPS计数
    this.stats.frames++;
    const timeSinceLastUpdate = performance.now() - this.stats.lastUpdate;

    if (timeSinceLastUpdate >= this.stats.updateInterval) {
      this.stats.fps = (this.stats.frames * 1000) / timeSinceLastUpdate;
      this.stats.frameTime = timeSinceLastUpdate / this.stats.frames;
      this.stats.frames = 0;
      this.stats.lastUpdate = performance.now();
    }
  }

  updateScene(deltaTime) {
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

    // 更新体积光
    if (this.volumetricLights) {
      this.volumetricLights.forEach((light) => {
        if (light.material.uniforms.time) {
          light.material.uniforms.time.value += deltaTime;
        }
      });
    }

    // 更新相机
    if (this.camera && this.config.scene.camera.movement.autoRotate) {
      this.camera.position.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.config.scene.camera.movement.autoRotateSpeed
      );
      this.camera.lookAt(0, 0, 0);
    }
  }

  renderScene() {
    if (this.scene && this.camera && this.renderer) {
      // 执行渲染
      this.renderer.render(this.scene, this.camera);

      // 更新渲染统计
      if (this.debug.showPerformance) {
        this.debug.metrics.drawCalls = this.renderer.info.render.calls;
        this.debug.metrics.triangles = this.renderer.info.render.triangles;
      }
    }
  }

  initializePerformanceMonitoring() {
    // 性能监控状态
    this.stats = {
      fps: 0,
      frameTime: 0,
      lastTime: performance.now(),
      frames: 0,
      updateInterval: 1000,
      lastUpdate: performance.now(),
    };

    // 调试配置
    this.debug = {
      showPerformance: true,
      logUpdates: true,
      logInterval: 1000, // 日志输出间隔（毫秒）
    };

    // 性能配置
    this.performanceConfig = {
      throttleFrames: true,
      targetFPS: 60,
      minFrameTime: 1000 / 60,
      cullDistance: 3000,
      maxVisibleMeteors: 15,
      maxVisibleStars: 10000,
      updateFrequency: 1000 / 60, // 60fps的更新频率
    };

    // 动画状态
    this.animationState = {
      lastUpdateTime: performance.now(),
      deltaTime: 0,
      isAnimating: true,
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

    // 创建体积光
    this.volumetricLights = [];
    const lightConfig = this.cosmicConfig.volumetricLight;

    for (let i = 0; i < lightConfig.count; i++) {
      const size = THREE.MathUtils.randFloat(
        lightConfig.minSize,
        lightConfig.maxSize
      );
      const intensity = THREE.MathUtils.randFloat(
        lightConfig.minIntensity,
        lightConfig.maxIntensity
      );
      const color =
        lightConfig.colors[
          Math.floor(Math.random() * lightConfig.colors.length)
        ];

      const light = this.createVolumetricLight(size, color, intensity);
      this.volumetricLights.push(light);
      this.scene.add(light);
    }
  }

  createNebula(size, color, opacity) {
    const geometry = new THREE.PlaneGeometry(size, size);
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

    return new THREE.Mesh(geometry, material);
  }

  createVolumetricLight(size, color, intensity) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: color },
        intensity: { value: intensity },
      },
      vertexShader: this.getVolumetricLightVertexShader(),
      fragmentShader: this.getVolumetricLightFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    return new THREE.Mesh(geometry, material);
  }

  setupScene() {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.00015);

    // 设置场景背景
    this.scene.background = new THREE.Color(0x000000);

    // 创建容器
    this.container = document.getElementById("scene-container");
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
  }

  setupCamera() {
    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      5000
    );

    // 设置初始位置
    if (this.entranceAnimation && this.entranceAnimation.enabled) {
      this.camera.position.copy(this.entranceAnimation.startPosition);
    } else {
      this.camera.position.set(0, 0, 2000);
    }

    // 设置相机朝向
    this.camera.lookAt(0, 0, 0);
  }

  setupRenderer() {
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    // 配置渲染器
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;

    // 添加到容器
    this.container.appendChild(this.renderer.domElement);
  }

  getNebulaVertexShader() {
    return `
      varying vec2 vUv;
      void main() {
        vUv = uv;
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
      
      float noise(vec2 p) {
        return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float dist = length(uv);
        float alpha = smoothstep(1.0, 0.0, dist) * opacity;
        
        // 添加噪声效果
        float noise1 = noise(uv + time * 0.1);
        float noise2 = noise(uv * 2.0 - time * 0.2);
        alpha *= mix(noise1, noise2, 0.5) + 0.5;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  getVolumetricLightVertexShader() {
    return `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  getVolumetricLightFragmentShader() {
    return `
      uniform vec3 color;
      uniform float intensity;
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float dist = length(uv);
        
        // 创建光束效果
        float beam = smoothstep(1.0, 0.0, dist) * intensity;
        beam *= (1.0 + sin(time * 0.5)) * 0.5; // 添加脉冲效果
        
        // 添加光芒
        float rays = 0.0;
        for(float i = 0.0; i < 6.0; i++) {
          float angle = i * 3.14159 * 2.0 / 6.0;
          vec2 dir = vec2(cos(angle), sin(angle));
          rays += smoothstep(0.3, 0.0, abs(dot(normalize(uv), dir)));
        }
        
        float alpha = (beam + rays * 0.3) * intensity;
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  createStarfield() {
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: config.starfield.colors.base },
        highlightColor: { value: config.starfield.colors.highlight },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform vec3 baseColor;
        uniform vec3 highlightColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float intensity = 1.0 - dist * 2.0;
          vec3 finalColor = mix(baseColor, highlightColor, intensity);
          gl_FragColor = vec4(finalColor, intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    config.starfield.layers.forEach((layer) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(layer.count * 3);
      const sizes = new Float32Array(layer.count);
      const colors = new Float32Array(layer.count * 3);

      for (let i = 0; i < layer.count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = layer.distance;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        sizes[i] = THREE.MathUtils.randFloat(layer.size.min, layer.size.max);

        const color =
          config.starfield.colors.variants[
            Math.floor(Math.random() * config.starfield.colors.variants.length)
          ];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const stars = new THREE.Points(geometry, starMaterial.clone());
      this.scene.add(stars);
    });
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

    // 处理可见性变化
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });

    // 性能监控相关
    if (this.debug.showPerformance) {
      this.setupPerformanceMonitoring();
    }

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
}

// 等待 DOM 加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing SceneManager...");
  const manager = new SceneManager();
});