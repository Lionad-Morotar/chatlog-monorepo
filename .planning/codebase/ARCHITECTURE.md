# 架构

**分析日期:** 2026-02-23

## 模式概述

**整体:** 分层 CLI 架构，使用策略模式

**关键特性:**
- CLI 接口、业务逻辑和数据访问之间清晰分离
- 输出格式化使用策略模式 (JSON vs 表格)
- 函数式核心与命令式外壳
- 同步文件 I/O 保持简单
- 遗留兼容性重点 (与 C# 参考实现行为一致)

## 分层

**CLI 层 (入口点):**
- 用途: 参数解析、帮助文本、错误处理
- 位置: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/cli.ts`
- 包含: 进程参数处理、帮助显示、退出码
- 依赖: 命令路由层
- 被用于: 操作系统 (shebang: `#!/usr/bin/env node`)

**命令路由层:**
- 用途: 将命令路由到处理程序，解析选项
- 位置: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/commands/commandRouter.ts`
- 包含: `sessions:*` 和 `projects:*` 命令的命令处理程序
- 依赖: 服务层、输出层
- 被用于: CLI 层

**服务层 (业务逻辑):**
- 用途: 文件系统操作、数据解析、会话管理
- 位置: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/services/sessionParser.ts`
- 包含: JSONL 解析、项目发现、消息提取
- 依赖: 模型层
- 被用于: 命令路由层

**输出层 (表现层):**
- 用途: 格式化并显示结果
- 位置: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/output/`
- 包含: OutputFormatter 接口、TableFormatter、JsonFormatter、工厂函数
- 依赖: 模型层、工具层
- 被用于: 命令路由层

**模型层 (领域):**
- 用途: TypeScript 类型定义
- 位置: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/models.ts`
- 包含: SessionSummary、SessionMessage、ToolUse、JsonlEntry 的接口
- 依赖: 无
- 被用于: 所有其他层

**工具层 (共享):**
- 用途: 通用格式化工具
- 位置: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/utils/format.ts`
- 包含: 日期格式化、字节格式化、字符串截断
- 依赖: 无
- 被用于: 输出层

## 数据流

**会话列表流程:**

1. CLI 接收 `sessions list` 命令
2. CommandRouter 调用 `findProjectDir()` 定位 Claude Code 数据
3. CommandRouter 调用 `listSessions()` 解析所有 JSONL 文件
4. CommandRouter 通过 `createFormatter()` 创建格式化器
5. 格式化器将格式化后的输出写入 stdout

**会话详情流程:**

1. CLI 接收 `sessions show <id>` 命令
2. CommandRouter 将会话 ID 解析为文件路径
3. CommandRouter 调用 `parseSummary()` 提取元数据
4. 格式化器显示会话详情

**搜索流程:**

1. CLI 接收 `sessions search <query>` 命令
2. CommandRouter 遍历所有会话
3. 对每个会话，调用 `searchMessages()` 查找匹配项
4. 输出会话标题和格式化的匹配项

**状态管理:**
- 无持久状态
- 所有数据从 `~/.claude/projects/` 的 Claude Code JSONL 文件读取
- 纯函数，文件系统作为数据源

## 关键抽象

**OutputFormatter 接口:**
- 用途: 输出格式化的策略模式
- 示例: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/output/output.ts`
- 模式: 带工厂的策略模式
- 实现: TableFormatter (人类可读)、JsonFormatter (机器可读)

**Session Parser 函数:**
- 用途: 从 JSONL 文件提取结构化数据
- 示例: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/services/sessionParser.ts`
- 模式: 带行读取生成器的纯函数
- 关键函数: `parseSummary()`、`parseMessages()`、`searchMessages()`

**Command Router:**
- 用途: 中央命令分发
- 示例: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/commands/commandRouter.ts`
- 模式: 基于 switch 的路由的命令模式
- 返回: 退出码 (0 成功, 1 错误)

## 入口点

**CLI 入口点:**
- 位置: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/cli.ts`
- 触发: 通过 `npx` 或 `node` 直接执行
- 职责: 参数解析、帮助显示、错误处理、退出码
- 二进制名称: `chatlog` (在 package.json 中定义)

**库入口点:**
- 位置: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/index.ts`
- 触发: 从其他包 `import`
- 职责: 重新导出模型和 sessionParser 供程序使用

## 错误处理

**策略:** 快速失败，带退出码

**模式:**
- CLI 边界的 try-catch 捕获所有错误
- 命令处理程序返回数字退出码 (0 = 成功, 1 = 错误)
- 用户友好的错误消息写入 stderr
- 格式错误的 JSONL 行静默跳过 (防御性解析)

**错误示例:**
```typescript
// 来自 cli.ts
try {
  const code = route(args);
  process.exit(code);
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${msg}`);
  process.exit(1);
}
```

## 横切关注点

**日志:** 直接使用 console，带有用于有意输出的 eslint-disable 注释
**验证:** 通过 TypeScript 严格模式进行运行时验证；最小运行时检查
**认证:** 无需认证 (仅读取本地文件系统)
**配置:** 通过 `process.cwd()` 和 `--path` 选项进行基于环境的配置

---

*架构分析: 2026-02-23*
