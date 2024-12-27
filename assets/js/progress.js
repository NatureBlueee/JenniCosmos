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

    // 更新体积光
    if (this.volumetricLights) {
      this.volumetricLights.forEach((light) => {
        if (light.material.uniforms.time) {
          light.material.uniforms.time.value += deltaTime;
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

    // 设置场景背景（使用更亮的颜色以便于调试）
    this.scene.background = new THREE.Color(0x0a0a14);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

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
}

// 等待 DOM 加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing SceneManager...");
  const manager = new SceneManager();
});
