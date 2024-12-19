# Contributing to Starlit Monologue

👍🎉 首先，感谢你愿意为 Starlit Monologue 做出贡献！ 🎉👍

以下是参与项目贡献的指南。请仔细阅读，以确保我们能够有效地合作。

## 行为准则

本项目采用 [Contributor Covenant](https://www.contributor-covenant.org/version/2/0/code_of_conduct/) 行为准则。参与本项目即表示你同意遵守其条款。

## 如何贡献

### 报告 Bug

如果你发现了 bug，请创建一个 issue，并包含以下信息：

1. 问题的简要描述
2. 复现步骤
3. 预期行为
4. 实际行为
5. 截图（如果适用）
6. 运行环境信息
   - 浏览器版本
   - 操作系统
   - 设备类型

### 提出新功能

1. 首先创建一个 issue 描述你的想法
2. 标记为 "enhancement"
3. 等待社区讨论和维护者的反馈

### Pull Request 流程

1. Fork 项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发指南

#### 代码风格

- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循项目现有的代码风格
- 添加必要的注释
- 保持代码简洁明了

#### 提交信息规范

使用语义化的提交信息：

- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat: 添加流星尾迹效果
fix: 修复文字动画卡顿问题
docs: 更新 README 安装说明
```

#### 测试

- 添加新功能时，请添加相应的测试
- 确保所有测试通过
- 进行性能测试（如果适用）

### 开发设置

1. 安装依赖
```bash
npm install
```

2. 运行开发服务器
```bash
npm run dev
```

3. 运行测试
```bash
npm test
```

4. 检查代码风格
```bash
npm run lint
```

### 分支策略

- `main`: 主分支，保持稳定
- `develop`: 开发分支
- `feature/*`: 新功能分支
- `fix/*`: 修复分支
- `docs/*`: 文档更新分支

### 版本发布流程

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建发布标签
4. 发布到 npm（如果适用）

## 项目结构

```
project/
├── src/
│   ├── components/     # 组件
│   ├── systems/       # 核心系统
│   ├── shaders/       # 着色器
│   └── utils/         # 工具函数
├── tests/             # 测试文件
├── docs/              # 文档
└── examples/          # 示例
```

## 性能考虑

- 优化渲染性能
- 减少内存使用
- 优化动画流畅度
- 考虑移动设备兼容性

## 文档

- 更新 API 文档
- 添加示例代码
- 更新 README.md
- 添加必要的注释

## 许可证

通过提交 pull request，你同意你的贡献将使用与项目相同的 [MIT 许可证](LICENSE)。

## 联系方式

如有任何问题，请通过以下方式联系：

- 创建 Issue
- 发送邮件至 [项目邮箱]
- 访问 [项目主页] 