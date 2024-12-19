# Starlit Monologue

![Starlit Monologue](./assets/preview.png)

一个基于 Three.js 的交互式网页体验，结合星空、流星和动态文字效果，创造沉浸式的视觉体验。A Christmas Gift for Jenni

## ✨ 特性

- 🌌 多层次星空背景
- 🌠 动态流星系统
- ❄️ 飘雪效果
- 📝 渐进式文字显示
- 🌟 呼吸光效
- 🎮 沉浸式体验

## 🚀 快速开始

### 在线预览

访问 [Demo地址](#) 查看在线演示。

### 本地运行

1. 克隆项目
```bash
git clone https://github.com/yourusername/starlit-monologue.git
cd starlit-monologue
```

2. 安装依赖
```bash
npm install
```

3. 运行开发服务器
```bash
npm run dev
```

4. 打开浏览器访问 `http://localhost:3000`

## 🛠️ 技术栈

- Three.js - 3D渲染引擎
- WebGL - 着色器实现
- JavaScript - 动画系统
- CSS3 - 文字动画

## 📖 详细文档

### 系统架构

项目由以下主要模块组成：

#### 1. 场景管理器 (SceneManager)
- 场景初始化和管理
- 窗口缩放适配
- 子系统协调

#### 2. 星空系统 (Starfield)
- 5层深度星空层次
- 12,000个独立星点
- 动态颜色变化
- 缓慢旋转效果

#### 3. 流星系统 (MeteorSystem)
- 动态生成流星
- 真实拖尾渐变
- 随机生成时间和路径
- 最多35个同时存在的流星

#### 4. 雪花系统 (SnowSystem)
- 5,000个雪花粒子
- 风力影响系统
- 自然飘落效果
- 深度模拟

#### 5. 文字系统 (TextSystem)
- 逐字显示动画
- 平滑滚动效果
- 呼吸效果同步
- 三行文本同时显示

#### 6. 光效系统 (LightSystem)
- 动态点光源
- 大气光晕效果
- 呼吸效果
- 渐入动画

### 配置说明

可以通过修改 `config` 对象自定义各种效果参数：

```javascript
const config = {
    scene: {
        camera: {
            fov: 60,
            near: 0.1,
            far: 2000,
            position: { x: 0, y: 0, z: 20 }
        }
    },
    starfield: {
        count: 12000,
        size: { min: 0.08, max: 4.0 },
        range: 600,
        // ... 更多配置
    },
    // ... 其他系统配置
};
```

### 性能优化

项目采用以下优化策略：

1. 渲染优化
   - requestAnimationFrame 动画循环
   - 对象池复用粒子
   - CSS transform3d 硬件加速
   - 着色器计算优化
   - 视锥体剔除

2. 内存管理
   - 及时清理不可见元素
   - 优化事件监听器
   - 资源按需加载

## 📱 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

要求：
- WebGL 支持
- 推荐设备性能：中等及以上
- 最小屏幕分辨率：1024x768

## 🔧 开发指南

### 项目结构

```
project/
├── index.html          # 主页面
├── styles/             # 样式文件
├── scripts/           
│   ├── SceneManager.js # 场景管理
│   ├── MeteorSystem.js # 流星系统
│   ├── TextSystem.js   # 文字系统
│   └── ...
└── shaders/           
    ├── star.vert      # 星星顶点着色器
    ├── star.frag      # 星星片段着色器
    └── ...
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## 📝 更新日志

### Version 1.0.0 (2024-01-xx)

#### 新特性
- 实现基础场景渲染
- 添加星空背景系统
- 实现流星效果
- 添加文字动画系统
- 实现雪花效果
- 添加光效系统

#### 优化
- 性能优化
- 内存管理优化
- 动画流畅度提升

#### 修复
- 文字渲染问题
- 动画同步问题
- 内存泄漏问题

## 🤝 贡献指南

欢迎贡献代码和提出建议！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

- Nature - [GitHub](https://github.com/natureblueee)

## 🙏 致谢

- Three.js
- 所有贡献者
- 使用和支持这个项目的人

## 📞 联系方式

项目链接：[https://github.com/yourusername/starlit-monologue](https://github.com/yourusername/starlit-monologue)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/starlit-monologue&type=Date)](https://star-history.com/#yourusername/starlit-monologue&Date) 