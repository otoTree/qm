# 奇门遁甲应用部署指南

## 项目概述

这是一个基于 Next.js 15 的奇门遁甲应用，使用 React 19、TypeScript 和 Tailwind CSS 构建。

## 系统要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- 现代浏览器支持

## 快速部署

### 1. 克隆项目

```bash
git clone <your-repository-url>
cd qm
```

### 2. 安装依赖

使用 npm：
```bash
npm install
```

或使用 yarn：
```bash
yarn install
```

### 3. 环境配置

复制环境变量文件：
```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，配置必要的环境变量。

### 4. 开发环境运行

```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

### 5. 生产环境部署

#### 构建应用
```bash
npm run build
```

#### 启动生产服务器
```bash
npm start
```

## 主要依赖说明

### 核心框架
- **Next.js 15.3.3** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript 5** - 类型安全的 JavaScript

### UI 组件库
- **Radix UI** - 无样式的可访问组件
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **Lucide React** - 图标库

### 状态管理与数据
- **Zustand** - 轻量级状态管理
- **TanStack Query** - 数据获取和缓存
- **Dexie** - IndexedDB 包装器

### 工具库
- **clsx** - 条件类名工具
- **nanoid** - 唯一 ID 生成器
- **class-variance-authority** - 组件变体管理

## 部署平台

### Vercel (推荐)

1. 连接 GitHub 仓库到 Vercel
2. Vercel 会自动检测 Next.js 项目
3. 配置环境变量
4. 部署完成

### Netlify

1. 构建命令：`npm run build`
2. 发布目录：`.next`
3. 配置环境变量
4. 部署

### 自托管服务器

1. 安装 Node.js 和 npm
2. 克隆项目并安装依赖
3. 构建项目：`npm run build`
4. 使用 PM2 或类似工具管理进程：
   ```bash
   npm install -g pm2
   pm2 start npm --name "qm-app" -- start
   ```

## 环境变量配置

在 `.env.local` 文件中配置以下变量：

```env
# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend API Keys (Server-side only)
SILICONFLOW_API_KEY=your_siliconflow_api_key
QIMEN_API_KEY=your_qimen_api_key

# 其他必要的环境变量
# 根据项目需求添加
```

## 故障排除

### 常见问题

1. **依赖安装失败**
   - 清除缓存：`npm cache clean --force`
   - 删除 `node_modules` 和 `package-lock.json`，重新安装

2. **构建失败**
   - 检查 TypeScript 错误：`npm run lint`
   - 确保所有环境变量已正确配置

3. **运行时错误**
   - 检查浏览器控制台错误
   - 验证 API 端点是否可访问

## 性能优化

- 启用 Next.js 图片优化
- 配置适当的缓存策略
- 使用 CDN 加速静态资源
- 监控应用性能指标

## 安全注意事项

- 不要在客户端暴露敏感的环境变量
- 定期更新依赖包
- 配置适当的 CORS 策略
- 使用 HTTPS 部署

## 支持

如遇到部署问题，请检查：
1. Node.js 版本兼容性
2. 环境变量配置
3. 网络连接和防火墙设置
4. 服务器资源是否充足

---

**注意**：部署前请确保所有依赖都已正确安装，并且应用在本地环境中正常运行。