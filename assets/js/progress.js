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
        brightness: { min: 0.5, max: 1.0 },
        pulseSpeed: { min: 0.5, max: 1.5 },
      },
      {
        count: 5000,
        size: { min: 0.8, max: 1.5 },
        distance: 1800,
        color: new THREE.Color(0xb0c4de),
        rotationSpeed: 0.015,
        opacity: { min: 0.3, max: 0.6 },
        brightness: { min: 0.3, max: 0.7 },
        pulseSpeed: { min: 0.3, max: 0.8 },
      },
      {
        count: 8000,
        size: { min: 0.4, max: 0.8 },
        distance: 2500,
        color: new THREE.Color(0x87ceeb),
        rotationSpeed: 0.01,
        opacity: { min: 0.2, max: 0.5 },
        brightness: { min: 0.6, max: 1.0 },
        pulseSpeed: { min: 0.8, max: 1.2 },
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
    starburst: {
      enabled: true,
      rays: 6,
      scale: { min: 1.2, max: 2.0 },
      intensity: { min: 0.3, max: 0.7 },
    },
    clusters: {
      count: 6,
      size: { min: 100, max: 300 },
      density: { min: 50, max: 200 },
      color: new THREE.Color(0xe6e6fa),
      opacity: { min: 0.2, max: 0.4 },
    },
  },
  nebula: {
    count: 1,
    size: {
      min: 300,
      max: 400,
    },
    colors: [
      new THREE.Color(0x3366ff).multiplyScalar(0.5), // 蓝色
      new THREE.Color(0xff6633).multiplyScalar(0.3), // 橙色
      new THREE.Color(0x9933ff).multiplyScalar(0.4), // 紫色
      new THREE.Color(0x33ff99).multiplyScalar(0.3), // 青色
    ],
    opacity: {
      min: 0.2,
      max: 0.4,
    },
    animation: {
      speed: 0.05,
      turbulence: 0.3,
    },
  },
};

class SceneManager {
  constructor() {
    // 保留其他必要的初始化
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.width = 0;
    this.height = 0;
    // ... 其他属性 ...

    this.init();
  }

  init() {
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
    console.log("Meteors initialization skipped"); // 添加日志便于调试

    // 绑定事件
    this.bindEvents();
    console.log("Event listeners bound");

    // 定义动画方法
    this.animate = this.animate.bind(this);

    // 开始动画循环
    this.animate();

    this.initializeCosmicEffects = () => {
      // 只保留需要的效果初始化
      this.createStarfield();
      this.createStarClusters();
      // 添加魔法粒子初始化
    };

    // 在所有初始化完成后，添加进度面板
    this.initProgressPanel();
    console.log("Progress panel initialized");
  }

  // 添加进��面板初始化方法
  initProgressPanel() {
    if (document.querySelector(".progress-container")) return;

    const progressData = [
      {
        id: "concept",
        icon: "✧",
        title: "Initial Concept",
        progress: 100,
        color: "rgba(147, 51, 234, 0.8)",
        glowColor: "rgba(147, 51, 234, 0.2)",
        description: "The birth of an idea",
      },
      {
        id: "planning",
        icon: "✧",
        title: "Planning Phase",
        progress: 100,
        color: "rgba(79, 70, 229, 0.8)",
        glowColor: "rgba(79, 70, 229, 0.2)",
        description: "Structuring the journey",
      },
      {
        id: "design",
        icon: "✧",
        title: "Visual Design",
        progress: 100,
        color: "rgba(59, 130, 246, 0.8)",
        glowColor: "rgba(59, 130, 246, 0.2)",
        description: "Creating the aesthetic",
      },
      {
        id: "development",
        icon: "✧",
        title: "Core Development",
        progress: 75,
        color: "rgba(16, 185, 129, 0.8)",
        glowColor: "rgba(16, 185, 129, 0.2)",
        description: "Building the foundation",
      },
      {
        id: "integration",
        icon: "✧",
        title: "Integration",
        progress: 50,
        color: "rgba(245, 158, 11, 0.8)",
        glowColor: "rgba(245, 158, 11, 0.2)",
        description: "Connecting the pieces",
      },
      {
        id: "polish",
        icon: "✧",
        title: "Polish & Refinement",
        progress: 25,
        color: "rgba(239, 68, 68, 0.8)",
        glowColor: "rgba(239, 68, 68, 0.2)",
        description: "Adding the final touches",
      },
    ];

    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    const html = `
      <div class="cosmic-journey">
        <div class="journey-path">
          ${progressData
            .map(
              (item, i) => `
            <div class="milestone-node" 
                 style="--index: ${i}; --color: ${item.color}; --glow-color: ${item.glowColor}">
              <div class="node-content">
                <div class="cosmic-card">
                  <div class="card-glow"></div>
                  <div class="content-wrapper">
                    <span class="cosmic-icon">${item.icon}</span>
                    <div class="info">
                      <h3>${item.title}</h3>
                      <p>${item.description}</p>
                      <div class="progress-track">
                        <div class="progress-fill" style="width: 0%">
                          <div class="progress-stars"></div>
                        </div>
                      </div>
                    </div>
                    <span class="progress-value">0%</span>
                  </div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    progressContainer.innerHTML = html;

    const style = document.createElement("style");
    style.textContent = `
      .progress-container {
        position: fixed;
        inset: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .cosmic-journey {
        width: 100%;
        max-width: 1400px;
        padding: 4rem 2rem;
        position: relative;
      }

      .journey-path {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5rem 4rem;
        transform-style: preserve-3d;
        transform: perspective(2000px) rotateX(5deg) scale(0.95);
        position: relative;
      }

      /* 添加星云轨迹背景 */
      .journey-path::before {
        content: '';
        position: absolute;
        inset: -20%;
        background: 
          radial-gradient(
            circle at 30% 50%,
            var(--glow-color) 0%,
            transparent 60%
          ),
          radial-gradient(
            circle at 70% 50%,
            var(--color) 0%,
            transparent 60%
          );
        opacity: 0.05;
        filter: blur(40px);
        z-index: -1;
        animation: nebulaPulse 8s ease-in-out infinite;
      }

      .milestone-node {
        --delay: calc(var(--index) * 0.4s);
        --offset: calc(var(--index) * 25px);
        --rotation: calc(var(--index) * 3deg);
        position: relative;
        transform: 
          translateY(calc(var(--offset))) 
          rotate(var(--rotation))
          translateZ(0);
        opacity: 0;
        animation: fadeSlideIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        animation-delay: var(--delay);
      }

      /* 更有创意的节点分布 */
      .milestone-node:nth-child(3n + 1) {
        transform: 
          translateX(-15%) 
          translateY(calc(var(--offset) - 20px)) 
          rotate(calc(var(--rotation) * -1));
      }

      .milestone-node:nth-child(3n + 2) {
        transform: 
          translateY(calc(var(--offset) + 40px)) 
          rotate(calc(var(--rotation) * 0.5));
      }

      .milestone-node:nth-child(3n) {
        transform: 
          translateX(15%) 
          translateY(calc(var(--offset) + 20px)) 
          rotate(var(--rotation));
      }

      /* 添加星际连接线 */
      .milestone-node::before,
      .milestone-node::after {
        content: '';
        position: absolute;
        background: linear-gradient(
          90deg,
          transparent,
          var(--color),
          transparent
        );
        opacity: 0.2;
        filter: blur(1px);
      }

      .milestone-node::before {
        width: 200%;
        height: 1px;
        top: 50%;
        left: -50%;
        transform: rotate(calc(var(--rotation) * 2));
      }

      .milestone-node::after {
        width: 1px;
        height: 200%;
        left: 50%;
        top: -50%;
        transform: rotate(calc(var(--rotation) * -2));
      }

      /* 星云脉动动画 */
      @keyframes nebulaPulse {
        0%, 100% { 
          opacity: 0.05;
          transform: scale(1);
        }
        50% { 
          opacity: 0.08;
          transform: scale(1.1);
        }
      }

      /* 更自然的出现动画 */
      @keyframes fadeSlideIn {
        0% {
          opacity: 0;
          transform: 
            translateY(calc(var(--offset) + 30px)) 
            rotate(calc(var(--rotation) * 1.5))
            scale(0.9);
        }
        100% {
          opacity: 1;
          transform: 
            translateY(var(--offset)) 
            rotate(var(--rotation))
            scale(1);
        }
      }

      /* 悬停效果增强 */
      .cosmic-card:hover {
        transform: 
          translateZ(50px) 
          rotate(calc(var(--rotation) * 1.2))
          scale(1.05);
      }

      .cosmic-card:hover .card-glow {
        opacity: 0.3;
        transform: scale(1.8);
      }

      /* 添加流星轨迹效果 */
      .progress-track::before {
        content: '';
        position: absolute;
        top: -200%;
        left: 0;
        width: 100%;
        height: 400%;
        background: linear-gradient(
          to bottom,
          transparent,
          var(--color),
          transparent
        );
        opacity: 0.1;
        transform: rotate(45deg);
        animation: meteorTrail 3s linear infinite;
        animation-delay: calc(var(--index) * -1s);
      }

      @keyframes meteorTrail {
        from { transform: translateX(-100%) rotate(45deg); }
        to { transform: translateX(200%) rotate(45deg); }
      }

      .cosmic-card {
        position: relative;
        padding: 2rem;
        /* 恢复有机背景板效果 */
        background: radial-gradient(
          ellipse at var(--x, 50%) var(--y, 50%),
          rgba(0, 0, 0, 0.4) 0%,
          rgba(0, 0, 0, 0.7) 100%
        );
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        transform-style: preserve-3d;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* 确保卡片内容正确显示 */
      .content-wrapper {
        position: relative;
        z-index: 2;
      }

      /* 增强卡片光晕效果 */
      .card-glow {
        position: absolute;
        inset: -50%;
        background: radial-gradient(
          circle at var(--x, 50%) var(--y, 50%),
          var(--glow-color) 0%,
          transparent 70%
        );
        opacity: 0.15;
        mix-blend-mode: screen;
        pointer-events: none;
        transition: all 0.6s ease;
      }

      /* 添加连接线容器 */
      .journey-path {
        position: relative;
      }

      /* 优化连接线效果 */
      .milestone-node::before {
        content: '';
        position: absolute;
        top: 50%;
        left: -30%;
        width: 60%;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--color),
          transparent
        );
        opacity: 0.3;
        transform-origin: left center;
        transform: rotate(calc(var(--index) * 15deg));
      }

      .milestone-node::after {
        content: '';
        position: absolute;
        top: -30%;
        left: 50%;
        width: 1px;
        height: 60%;
        background: linear-gradient(
          180deg,
          transparent,
          var(--color),
          transparent
        );
        opacity: 0.3;
        transform-origin: center bottom;
        transform: rotate(calc(var(--index) * -15deg));
      }

      .info h3 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.25rem;
        letter-spacing: 0.05em;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 0.5rem;
        /* 增强文字可读性 */
        text-shadow: 
          0 0 1px rgba(255, 255, 255, 0.9),
          0 0 15px var(--color),
          0 0 30px var(--glow-color);
      }

      .info p {
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.85);
        /* 增强描述文字可读性 */
        text-shadow: 
          0 1px 2px rgba(0, 0, 0, 0.8),
          0 0 15px rgba(0, 0, 0, 0.5);
      }

      /* 优化连接线样式 */
      .connection-line {
        position: absolute;
        height: 2px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--color) 50%,
          transparent
        );
        opacity: 0.4;
        filter: blur(1px);
        pointer-events: none;
        transform-origin: left center;
        z-index: 1;
      }

      /* 添加发光效果 */
      .connection-line::after {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        right: 0;
        bottom: -2px;
        background: inherit;
        filter: blur(4px);
        opacity: 0.4;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(progressContainer);

    // 添加鼠标跟踪效果
    const cards = document.querySelectorAll(".cosmic-card");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.querySelector(".card-glow").style.setProperty("--x", `${x}%`);
        card.querySelector(".card-glow").style.setProperty("--y", `${y}%`);
      });
    });

    // 延迟加载进度条动画
    setTimeout(() => {
      document.querySelectorAll(".milestone-node").forEach((node, i) => {
        const data = progressData[i];
        const fill = node.querySelector(".progress-fill");
        const value = node.querySelector(".progress-value");

        fill.style.width = `${data.progress}%`;
        value.textContent = `${data.progress}%`;
      });
    }, 500);
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

    // 更新场景
    this.updateScene(deltaTime);

    // 确保在渲染前检查必要组件
    if (this.scene && this.camera && this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }

    requestAnimationFrame(this.animate.bind(this));
  }

  updateScene(deltaTime) {
    if (!this.scene || !this.config) return;

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

  initializePerformanceMonitoring() {
    // 初始化性能监控状态
    this.stats = {
      fps: 0,
      frameTime: 0,
      lastTime: performance.now(),
      frames: 0,
    };

    // 初始化调试配置
    this.debug = {
      showPerformance: true,
      metrics: {
        drawCalls: 0,
        triangles: 0,
        points: 0,
        lines: 0,
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
    this.cosmicConfig = {
      starfield: {
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
          starburst: {
            enabled: true,
            rays: 6,
            scale: { min: 1.2, max: 2.0 },
            intensity: { min: 0.3, max: 0.7 },
          },
        },
        clusters: {
          count: 6,
          size: { min: 100, max: 300 },
          density: { min: 50, max: 200 },
          color: new THREE.Color(0xe6e6fa),
          opacity: { min: 0.2, max: 0.4 },
        },
      },
      nebulae: {
        count: 12,
        minRadius: 1500,
        maxRadius: 4000,
        minOpacity: 0.2,
        maxOpacity: 0.4,
        colors: [
          new THREE.Color(0x3366ff).multiplyScalar(0.5),
          new THREE.Color(0xff6633).multiplyScalar(0.3),
          new THREE.Color(0x9933ff).multiplyScalar(0.4),
          new THREE.Color(0x33ff99).multiplyScalar(0.3),
          new THREE.Color(0xff3366).multiplyScalar(0.2),
          new THREE.Color(0xffff33).multiplyScalar(0.2),
        ],
        dustClouds: {
          count: 8,
          size: {
            min: 3000,
            max: 4000,
          },
          opacity: { min: 0.1, max: 0.2 },
        },
        animation: {
          rotationSpeed: 0.0001,
          colorTransitionSpeed: 0.001,
          pulseSpeed: 0.5,
          turbulence: 0.15,
        },
        ambient: {
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
        },
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
  }

  initializeCosmicEffects() {
    this.nebulae = [];
    const nebulaConfig = this.cosmicConfig.nebulae;

    // 新的星云颜色组合 - 偏玫瑰星云的色调
    const nebulaColors = [
      new THREE.Color(0xff69b4).multiplyScalar(0.4), // 粉红色
      new THREE.Color(0xe6e6fa).multiplyScalar(0.5), // 淡紫色
      new THREE.Color(0xdda0dd).multiplyScalar(0.4), // 梅红色
      new THREE.Color(0xff1493).multiplyScalar(0.3), // 深粉色
      new THREE.Color(0xdb7093).multiplyScalar(0.4), // 淡紫红
      new THREE.Color(0xffc0cb).multiplyScalar(0.5), // 粉色
    ];

    for (let i = 0; i < nebulaConfig.count; i++) {
      const size = THREE.MathUtils.randFloat(
        nebulaConfig.minRadius,
        nebulaConfig.maxRadius
      );
      const opacity = THREE.MathUtils.randFloat(
        nebulaConfig.minOpacity * 1.2,
        nebulaConfig.maxOpacity * 1.2
      );
      const color =
        nebulaColors[Math.floor(Math.random() * nebulaColors.length)];

      const nebula = this.createNebula(size, color, opacity);

      // 随机旋转星云
      nebula.rotation.z = Math.random() * Math.PI * 2;

      this.nebulae.push(nebula);
      this.scene.add(nebula);
    }
  }

  createNebula(size, color, opacity) {
    const geometry = new THREE.PlaneGeometry(size, size * 1.6, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
        opacity: { value: opacity * 1.3 }, // 略微增加整体不透明度
      },
      vertexShader: this.getNebulaVertexShader(),
      fragmentShader: this.getNebulaFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const nebula = new THREE.Mesh(geometry, material);
    nebula.rotation.z = Math.PI * 0.1;

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

    // 简化相机动画状态，只保留实际使用的参数
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
        speed: 0.00015,
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
      
      // 优化的噪声函数
      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = i.x + i.y * 157.0;
        return mix(
          mix(hash(n), hash(n + 1.0), f.x),
          mix(hash(n + 157.0), hash(n + 158.0), f.x),
          f.y
        );
      }
      
      float fbm(vec2 p, float speed) {
        float sum = 0.0;
        float amp = 0.5;
        float freq = 1.0;
        vec2 shift = vec2(time * speed);
        
        for(int i = 0; i < 3; i++) {
          sum += noise(p * freq + shift) * amp;
          freq *= 2.0;
          amp *= 0.5;
          shift *= 1.3;
        }
        return sum;
      }
      
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float angle = -0.2;
        vec2 rotatedUV = vec2(
          uv.x * cos(angle) - uv.y * sin(angle),
          uv.x * sin(angle) + uv.y * cos(angle)
        );
        
        // 创建多层结构
        // 1. 深层暗云
        float darkCloud = fbm(rotatedUV * 1.5 - time * 0.02, 0.05);
        
        // 2. ��要气态结构
        float mainStructure = fbm(rotatedUV * 2.0 + time * 0.05, 0.1);
        float pillar = smoothstep(0.3, -0.3, 
          abs(rotatedUV.x + sin(rotatedUV.y * 2.0) * 0.15) - 
          0.2 + mainStructure * 0.3
        );
        pillar *= smoothstep(-1.0, -0.5, rotatedUV.y) * 
                  smoothstep(1.2, -0.2, rotatedUV.y);
        
        // 3. 明亮的电离区
        float brightRegion = fbm(rotatedUV * 3.0 + time * 0.1, 0.15);
        float ionized = smoothstep(0.4, 0.0, 
          length(rotatedUV - vec2(0.0, 0.3)) - 0.3 + brightRegion * 0.2
        );
        
        // 4. 细小的丝状结构
        float filaments = fbm(rotatedUV * 4.0 + time * 0.08, 0.12);
        
        // 组合所有层次
        float structure = pillar;
        structure = mix(structure, structure * (1.0 + darkCloud), 0.5);
        structure = max(structure, ionized * 0.7);
        structure += filaments * 0.15 * structure;
        
        // 密度变化
        float density = fbm(rotatedUV * 2.5 - time * 0.03, 0.07);
        structure *= mix(0.6, 1.0, density);
        
        // 边缘处理
        float edge = smoothstep(1.2, 0.0, length(rotatedUV));
        float alpha = structure * edge * opacity;
        
        // 颜色变化
        vec3 finalColor = color;
        // 添加深度色彩变化
        finalColor += vec3(
          density * 0.1,
          brightRegion * 0.15,
          filaments * 0.05
        );
        
        // 暗部处理
        float darkness = smoothstep(0.2, 0.0, structure);
        finalColor *= mix(1.0, 0.7, darkness);
        
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
    const brightness = [];
    const pulseSpeed = [];
    const starburstScale = [];

    // 显著增加星星数量
    const starCount = 35000;

    for (let i = 0; i < starCount; i++) {
      let radius, size, brightnessValue, pulseSpeedValue, starburstValue;

      // 调整星星分布，使其更配合星云
      if (i < starCount * 0.03) {
        // 3% 超亮主星
        radius = Math.random() * 1000; // 更近的距离
        size = THREE.MathUtils.randFloat(2.5, 4.0);
        brightnessValue = THREE.MathUtils.randFloat(0.9, 1.0);
        pulseSpeedValue = THREE.MathUtils.randFloat(0.8, 1.2);
        starburstValue = THREE.MathUtils.randFloat(2.0, 3.0);
      } else if (i < starCount * 0.15) {
        // 12% 明亮星星
        radius = Math.random() * 1500;
        size = THREE.MathUtils.randFloat(1.5, 2.5);
        brightnessValue = THREE.MathUtils.randFloat(0.7, 0.9);
        pulseSpeedValue = THREE.MathUtils.randFloat(0.6, 1.0);
        starburstValue = THREE.MathUtils.randFloat(1.5, 2.0);
      } else if (i < starCount * 0.4) {
        // 25% 中等亮度星星
        radius = Math.random() * 1800;
        size = THREE.MathUtils.randFloat(0.8, 1.5);
        brightnessValue = THREE.MathUtils.randFloat(0.5, 0.7);
        pulseSpeedValue = THREE.MathUtils.randFloat(0.4, 0.8);
        starburstValue = THREE.MathUtils.randFloat(1.0, 1.5);
      } else {
        // 60% 背景星星
        radius = Math.random() * 2000;
        size = THREE.MathUtils.randFloat(0.3, 0.8);
        brightnessValue = THREE.MathUtils.randFloat(0.3, 0.5);
        pulseSpeedValue = THREE.MathUtils.randFloat(0.2, 0.6);
        starburstValue = THREE.MathUtils.randFloat(0.5, 1.0);
      }

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      vertices.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      sizes.push(size);

      // 随机不透明度
      const opacity = THREE.MathUtils.randFloat(0.1, 1.0);
      opacities.push(opacity);

      // 更丰富的颜色变化
      const colorChoice = Math.random();
      if (colorChoice < 0.2) {
        // 暖白色星星
        colors.push(1.0, 0.98, 0.95);
      } else if (colorChoice < 0.4) {
        // 淡粉色星星
        colors.push(1.0, 0.9, 0.95);
      } else if (colorChoice < 0.6) {
        // 纯白色星星
        colors.push(1.0, 1.0, 1.0);
      } else if (colorChoice < 0.8) {
        // 淡金色星星
        colors.push(1.0, 0.95, 0.85);
      } else {
        // 淡蓝色星星（对比色）
        colors.push(0.9, 0.95, 1.0);
      }

      brightness.push(brightnessValue);
      pulseSpeed.push(pulseSpeedValue);
      starburstScale.push(starburstValue);
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
    geometry.setAttribute(
      "brightness",
      new THREE.Float32BufferAttribute(brightness, 1)
    );
    geometry.setAttribute(
      "pulseSpeed",
      new THREE.Float32BufferAttribute(pulseSpeed, 1)
    );
    geometry.setAttribute(
      "starburstScale",
      new THREE.Float32BufferAttribute(starburstScale, 1)
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: this.getStarVertexShader(),
      fragmentShader: this.getStarFragmentShader(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);

    console.log("Starfield created with", starCount, "stars");
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
        
        // 减小脉冲效果
        float pulse = sin(time * pulseSpeed) * 0.15 + 0.85;
        vBrightness = brightness * pulse;
        vStarburstScale = starburstScale;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // 调整大小变化
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
        
        // 更强的核心亮度
        float core = smoothstep(0.5, 0.1, dist) * 1.5;
        
        // 更大的光晕范围
        float glow = exp(-1.5 * dist);  // 减小衰减系数
        
        // 更明显的星芒效果
        float rays = 0.0;
        float numRays = 4.0;
        for(float i = 0.0; i < numRays; i++) {
          float angle = i * 3.14159 * 2.0 / numRays;
          vec2 dir = vec2(cos(angle), sin(angle));
          float ray = pow(abs(dot(normalize(center), dir)), 12.0);  // 减小幂次，使光芒更明显
          rays += ray * 0.25;  // 增加光芒强度
        }
        
        // 组合效果，增加整体亮度
        float brightness = (core + glow * 0.5 + rays * vStarburstScale) * 1.2;
        brightness *= vBrightness;
        
        vec3 finalColor = vColor * brightness;
        float alpha = brightness * smoothstep(1.0, 0.0, dist);
        
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
        
        // 添加微弱的闪烁效���
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

  // 添加新的星云细��着色器
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

  // 添加动画更新方法
  updateNebulae(deltaTime) {
    if (!this.nebulae) return;

    this.nebulae.forEach((nebula, index) => {
      if (!nebula.material || !nebula.material.uniforms) return;

      // 更新时间
      nebula.material.uniforms.time.value += deltaTime;

      // 旋转
      nebula.rotation.z +=
        this.cosmicConfig.nebulae.animation.rotationSpeed * deltaTime;

      // 颜色渐变
      const colorIndex =
        Math.floor(
          nebula.material.uniforms.time.value *
            this.cosmicConfig.nebulae.animation.colorTransitionSpeed
        ) % this.cosmicConfig.nebulae.colors.length;
      const nextColorIndex =
        (colorIndex + 1) % this.cosmicConfig.nebulae.colors.length;

      const currentColor = this.cosmicConfig.nebulae.colors[colorIndex];
      const nextColor = this.cosmicConfig.nebulae.colors[nextColorIndex];
      const t =
        (nebula.material.uniforms.time.value *
          this.cosmicConfig.nebulae.animation.colorTransitionSpeed) %
        1;

      nebula.material.uniforms.color.value.lerpColors(
        currentColor,
        nextColor,
        t
      );
    });
  }

  // 将 initProgressInteractions 方法添加到 SceneManager 类中
  initProgressInteractions() {
    const groups = document.querySelectorAll(".progress-group");

    groups.forEach((group) => {
      // 添加悬停效果
      group.addEventListener("mouseenter", () => {
        const fill = group.querySelector(".progress-fill");
        if (fill) {
          fill.style.filter = "brightness(1.2)";
          this.createStardustEffect(group);
        }
      });

      group.addEventListener("mouseleave", () => {
        const fill = group.querySelector(".progress-fill");
        if (fill) {
          fill.style.filter = "brightness(1)";
        }
      });

      // 初始化进度条动画
      const fill = group.querySelector(".progress-fill");
      if (fill) {
        const width = fill.style.width;
        fill.style.width = "0%";
        setTimeout(() => {
          fill.style.width = width;
        }, 100);
      }
    });
  }

  createStardustEffect(element) {
    const rect = element.getBoundingClientRect();
    const particleCount = 5;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "stardust-particle";
      particle.style.cssText = `
        position: fixed;
        pointer-events: none;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, rgba(100, 181, 246, 0.8), transparent);
        border-radius: 50%;
        z-index: 1000;
      `;

      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;

      particle.style.left = x + "px";
      particle.style.top = y + "px";

      document.body.appendChild(particle);

      particle.animate(
        [
          {
            transform: "translate(0, 0) scale(1)",
            opacity: 1,
          },
          {
            transform: `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: 1000,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        }
      ).onfinish = () => particle.remove();
    }
  }

  createStardustConnection(element) {
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.className = "stardust-connection";
    canvas.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // 设置画布大小
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.body.appendChild(canvas);

    // 创建连接动画
    const points = [];
    const maxPoints = 5;

    const animate = () => {
      if (points.length < maxPoints) {
        points.push({
          x: rect.left + Math.random() * rect.width,
          y: rect.top + Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
        });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制点
      for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i];
        point.x += point.vx;
        point.y += point.vy;
        point.life -= 0.02;

        if (point.life <= 0) {
          points.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 181, 246, ${point.life})`;
        ctx.fill();

        // 绘制连接线
        for (let j = i + 1; j < points.length; j++) {
          const other = points[j];
          const dx = other.x - point.x;
          const dy = other.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 50) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(100, 181, 246, ${Math.min(point.life, other.life) * 0.5})`;
            ctx.stroke();
          }
        }
      }

      if (points.length > 0) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    canvas.style.opacity = "1";
    animate();
  }
}

// 初始化场景
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing SceneManager...");
  const sceneManager = new SceneManager();
});

// 重写连接线创建函数，确保正确定位
function createConnectionLines() {
  document
    .querySelectorAll(".connection-line")
    .forEach((line) => line.remove());

  const nodes = document.querySelectorAll(".milestone-node");
  const container = document.querySelector(".journey-path");

  if (!container || nodes.length < 2) return;

  nodes.forEach((node, i) => {
    if (i < nodes.length - 1) {
      const currentNode = node;
      const nextNode = nodes[i + 1];

      const line = document.createElement("div");
      line.className = "connection-line";
      container.appendChild(line);

      const rect1 = currentNode.getBoundingClientRect();
      const rect2 = nextNode.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const x1 = rect1.left + rect1.width / 2 - containerRect.left;
      const y1 = rect1.top + rect1.height / 2 - containerRect.top;
      const x2 = rect2.left + rect2.width / 2 - containerRect.left;
      const y2 = rect2.top + rect2.height / 2 - containerRect.top;

      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

      line.style.cssText = `
        width: ${length}px;
        left: ${x1}px;
        top: ${y1}px;
        transform: rotate(${angle}deg);
        animation-delay: ${i * 0.2}s;
      `;
    }
  });
}

// 确保在DOM加载完成后创建连接线
document.addEventListener("DOMContentLoaded", () => {
  // 延迟执行以确保其他元素都已经正确渲染
  setTimeout(() => {
    createConnectionLines();
    console.log("Connection lines creation attempted");
  }, 1000);
});

// 添加窗口调整时重新计算
window.addEventListener("resize", () => {
  setTimeout(createConnectionLines, 100);
});

const connectionStyle = document.createElement("style");
connectionStyle.textContent = `
  .energy-path {
    position: absolute;
    height: 30px; /* 增加通道高度 */
    pointer-events: none;
    z-index: 10;
    /* 添加通道基础发光 */
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(147, 51, 234, 0.1) 50%,
      transparent
    );
  }

  /* 能量通道 */
  .energy-channel {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 4px;
    transform: translateY(-50%);
    background: rgba(147, 51, 234, 0.2);
    filter: blur(1px);
  }

  /* 多个能量粒子 */
  .energy-particle {
    position: absolute;
    width: 20px;
    height: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.9),
      rgba(147, 51, 234, 0.8) 40%,
      transparent 80%
    );
    filter: drop-shadow(0 0 10px rgba(147, 51, 234, 0.8));
  }

  /* 创建多个粒子实例 */
  .energy-particle:nth-child(1) { animation: particleFlow 2s linear infinite; }
  .energy-particle:nth-child(2) { animation: particleFlow 2s linear infinite 0.4s; }
  .energy-particle:nth-child(3) { animation: particleFlow 2s linear infinite 0.8s; }
  .energy-particle:nth-child(4) { animation: particleFlow 2s linear infinite 1.2s; }
  .energy-particle:nth-child(5) { animation: particleFlow 2s linear infinite 1.6s; }

  @keyframes particleFlow {
    0% {
      left: -20px;
      opacity: 0;
      transform: translateY(-50%) scale(0.8);
    }
    10% {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
    90% {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
    100% {
      left: calc(100% + 20px);
      opacity: 0;
      transform: translateY(-50%) scale(0.8);
    }
  }

  /* 通道发光动画 */
  .energy-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(147, 51, 234, 0.3),
      transparent
    );
    animation: channelPulse 2s ease-in-out infinite;
  }

  @keyframes channelPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
`;

document.head.appendChild(connectionStyle);

function createEnergyConnections() {
  document.querySelectorAll(".energy-path").forEach((path) => path.remove());

  const nodes = document.querySelectorAll(".milestone-node");
  const container = document.querySelector(".journey-path");

  if (!container || nodes.length < 2) return;

  nodes.forEach((node, i) => {
    if (i < nodes.length - 1) {
      const currentNode = node;
      const nextNode = nodes[i + 1];

      const path = document.createElement("div");
      path.className = "energy-path";
      container.appendChild(path);

      // 创建能量通道
      const channel = document.createElement("div");
      channel.className = "energy-channel";
      path.appendChild(channel);

      // 创建通道发光效果
      const glow = document.createElement("div");
      glow.className = "energy-glow";
      path.appendChild(glow);

      // 创建多个能量粒子
      for (let j = 0; j < 5; j++) {
        const particle = document.createElement("div");
        particle.className = "energy-particle";
        path.appendChild(particle);
      }

      const rect1 = currentNode.getBoundingClientRect();
      const rect2 = nextNode.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const x1 = rect1.left + rect1.width / 2 - containerRect.left;
      const y1 = rect1.top + rect1.height / 2 - containerRect.top;
      const x2 = rect2.left + rect2.width / 2 - containerRect.left;
      const y2 = rect2.top + rect2.height / 2 - containerRect.top;

      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

      path.style.cssText = `
        width: ${length}px;
        left: ${x1}px;
        top: ${y1}px;
        transform: rotate(${angle}deg);
      `;
    }
  });
}

// 确保在DOM加载完成和窗口调整时创建连接
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(createEnergyConnections, 1000);
});

window.addEventListener("resize", () => {
  setTimeout(createEnergyConnections, 100);
});
