# 外部集成

**分析日期:** 2026-02-23

## API 和外部服务

**Claude Code 本地存储:**
- 无外部 API 调用
- 仅从本地文件系统读取
- 数据源: `~/.claude/projects/` 目录
- 格式: JSONL 文件 (Claude Code 会话日志)

**无外部服务:**
- 无 HTTP 客户端库
- 无需 API 密钥
- 无网络依赖

## 数据存储

**数据库:**
- 无 (仅基于文件系统)

**文件存储:**
- 本地文件系统
- 读取位置: `~/.claude/projects/{project-key}/{session-id}.jsonl`
- 项目键格式: 绝对路径，路径分隔符替换为连字符
- 文件格式: JSONL (JSON Lines)

**缓存:**
- 无

## 认证与身份

**认证提供方:**
- 无需认证
- 无认证流程
- 无身份管理
- 无授权检查

**访问控制:**
- 依赖文件系统权限
- 读取用户主目录中的用户自有文件

## 监控与可观测性

**错误追踪:**
- 无 (仅使用 console.error)

**日志:**
- 仅控制台输出
- 无结构化日志框架
- 无日志聚合

## CI/CD 与部署

**托管:**
- npm 仓库 (用于包分发)
- GitHub 仓库存放源码

**CI 流水线:**
- GitHub Actions (`.github/workflows/build.yml`)
- 触发条件: 推送到 main 分支, workflow_dispatch
- 步骤:
  1. 检出代码
  2. 设置 Node.js 20
  3. 安装 pnpm 9.15.5
  4. 安装依赖 (`pnpm install --frozen-lockfile --ignore-scripts`)
  5. 构建 (`pnpm run build`)

**无自动部署:**
- 无自动部署
- 需要手动发布到 npm

## 环境配置

**必需环境变量:**
- 无

**可选配置:**
- `--path` CLI 标志覆盖项目目录
- `--format` CLI 标志设置输出格式

**密钥存储位置:**
- 无 (无需密钥)

## Webhooks 与回调

**传入:**
- 无

**传出:**
- 无

## 依赖分析

**零外部运行时依赖:**
- 仅使用 Node.js 内置模块:
  - `node:fs` - 文件系统操作
  - `node:path` - 路径处理
  - `node:os` - 操作系统工具 (homedir)

**仅开发依赖:**
- TypeScript 工具链
- 类型定义

## 安全考虑

**输入验证:**
- 文件路径解析和验证
- JSON 解析使用 try/catch
- 无用户输入传递到 shell

**数据隐私:**
- 仅处理本地数据
- 无数据传输
- 无遥测

---

*集成审计: 2026-02-23*
