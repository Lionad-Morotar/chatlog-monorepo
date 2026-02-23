# 技术栈

**分析日期:** 2026-02-23

## 编程语言

**主要语言:**
- TypeScript 5.5.4 - 所有应用程序代码
- Node.js 内置模块 (fs, path, os)

**次要语言:**
- JSON - 配置文件
- YAML - GitHub Actions, 工作区配置
- C# (遗留) - 保留在 `refs/claude-log-cli/` 供参考

## 运行时

**环境:**
- Node.js 20+ (CI 配置为 Node 20)
- 目标: ES2022
- 模块系统: CommonJS

**包管理器:**
- pnpm 9.15.5 (在 `packageManager` 字段中指定)
- 锁定文件: `pnpm-lock.yaml` (已存在)
- 通过 `pnpm-workspace.yaml` 支持工作区

## 框架

**核心:**
- TypeScript 编译器 (tsc) 5.5.4 - 类型检查和编译
- tsx 4.19.2 - 开发时 TypeScript 执行

**测试:**
- 未配置 (无测试框架)

**构建/开发:**
- 带项目引用的 TypeScript 编译器
- tsx 用于快速开发迭代

## 关键依赖

**核心依赖:**
- `typescript` 5.5.4 - 语言支持和编译器
- `tsx` 4.19.2 - 快速 TypeScript 执行
- `@types/node` 20.11.30 - Node.js 类型定义

**基础设施:**
- 无 (仅使用 Node.js 内置模块)

## 配置

**TypeScript 配置 (`packages/claude/tsconfig.json`):**
- 目标: ES2022
- 模块: CommonJS
- 模块解析: Node
- 启用严格模式
- 输出目录: `dist/`
- 源目录: `src/`
- 启用声明文件
- 禁用源映射 (生产构建)

**构建配置:**
- 入口点: `src/cli.ts` → `dist/cli.js`
- 二进制名称: `chatlog`
- 构建命令: `tsc -p tsconfig.json`
- 构建后: 对 CLI 可执行文件应用 chmod 755

**工作区配置:**
- 使用 pnpm 工作区的 monorepo 结构
- 单一包: `@lionad/chatlog-claude`
- 根脚本代理到包脚本

## 平台要求

**开发环境:**
- Node.js 20+
- pnpm 9.15.5
- macOS, Linux, 或 Windows

**生产环境:**
- Node.js 20+
- 对 `~/.claude/projects/` 目录的读取权限
- 对当前工作目录的读取权限用于项目检测

**包分发:**
- npm 包: `@lionad/chatlog-claude`
- 通过 `npm install -g` 全局安装 CLI
- 可执行文件: `dist/cli.js` (755 权限)

---

*技术栈分析: 2026-02-23*
