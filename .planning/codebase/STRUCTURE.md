# 代码结构

**分析日期:** 2026-02-23

## 目录布局

```
/Users/lionad/Github/Run/claude-log-cli/
├── .github/workflows/          # CI/CD 配置
├── .planning/codebase/         # 代码库文档 (本文档)
├── .vscode/                    # VS Code 设置
├── node_modules/               # 依赖 (生成)
├── packages/
│   └── claude/                 # 主 CLI 包
│       ├── dist/               # 编译后的 JavaScript (生成)
│       ├── src/
│       │   ├── commands/       # 命令路由
│       │   ├── output/         # 输出格式化器
│       │   ├── services/       # 业务逻辑
│       │   ├── utils/          # 共享工具
│       │   ├── cli.ts          # CLI 入口点
│       │   ├── index.ts        # 库入口点
│       │   └── models.ts       # 类型定义
│       ├── package.json        # 包清单
│       └── tsconfig.json       # TypeScript 配置
├── refs/
│   └── claude-log-cli/         # C# 参考实现
├── package.json                # 根清单 (monorepo)
├── pnpm-workspace.yaml         # PNPM 工作区配置
└── pnpm-lock.yaml              # 锁定文件
```

## 目录用途

**`/packages/claude/src/commands/`:**
- 用途: 命令路由和处理程序
- 包含: 命令解析、选项处理、命令分发
- 关键文件: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/commands/commandRouter.ts`

**`/packages/claude/src/output/`:**
- 用途: 输出格式化策略
- 包含: 格式化器接口、实现、工厂
- 关键文件: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/output/output.ts`、
  `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/output/tableFormatter.ts`、
  `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/output/jsonFormatter.ts`、
  `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/output/index.ts`

**`/packages/claude/src/services/`:**
- 用途: 核心业务逻辑和数据访问
- 包含: 会话解析、文件系统操作
- 关键文件: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/services/sessionParser.ts`

**`/packages/claude/src/utils/`:**
- 用途: 共享工具函数
- 包含: 格式化辅助函数
- 关键文件: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/utils/format.ts`

**`/packages/claude/dist/`:**
- 用途: 编译后的 JavaScript 输出
- 包含: .js 和 .d.ts 文件
- 生成: 是 (通过 `tsc`)
- 提交: 否 (在 .gitignore 中)

**`/refs/claude-log-cli/`:**
- 用途: C# 参考实现
- 包含: 用于行为兼容性的遗留 C# 代码
- 用于: 确保与原始实现的功能对等

## 关键文件位置

**入口点:**
- `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/cli.ts`: CLI 可执行入口
- `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/index.ts`: 库入口 (导出)

**配置:**
- `/Users/lionad/Github/Run/claude-log-cli/package.json`: 根 monorepo 配置
- `/Users/lionad/Github/Run/claude-log-cli/pnpm-workspace.yaml`: 工作区定义
- `/Users/lionad/Github/Run/claude-log-cli/packages/claude/package.json`: 包清单
- `/Users/lionad/Github/Run/claude-log-cli/packages/claude/tsconfig.json`: TypeScript 编译器选项

**核心逻辑:**
- `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/services/sessionParser.ts`: 主要业务逻辑
- `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/commands/commandRouter.ts`: 命令分发

**类型定义:**
- `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/models.ts`: 所有领域接口

## 命名规范

**文件:**
- 实现文件使用 camelCase: `commandRouter.ts`、`sessionParser.ts`
- 描述性名称匹配导出内容

**目录:**
- 逻辑分组使用 camelCase: `commands/`、`services/`、`utils/`、`output/`

**类:**
- PascalCase 带后缀表示模式: `TableFormatter`、`JsonFormatter`
- 接口: `OutputFormatter` (无 I-前缀)

**函数:**
- camelCase，描述性: `parseSummary()`、`findProjectDir()`、`createFormatter()`
- 工厂函数: `createFormatter()` (动词 + 名词)

**类型:**
- 接口使用 PascalCase: `SessionSummary`、`SessionMessage`
- 枚举值使用 PascalCase: `OutputFormat.Table`、`OutputFormat.Json`

## 添加新代码的位置

**新命令:**
- 命令处理程序: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/commands/commandRouter.ts`
  - 在 switch 语句中添加 case
  - 实现处理程序函数
- 更新帮助文本: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/cli.ts`

**新服务/解析器函数:**
- 实现: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/services/sessionParser.ts`
- 从以下位置导出: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/index.ts` (如果是公共 API)

**新输出格式化器:**
- 实现: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/output/[name]Formatter.ts`
- 注册: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/output/index.ts`
- 添加到: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/output/output.ts` 中的 `OutputFormat` 枚举

**新模型/类型:**
- 添加: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/models.ts`
- 导出: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/index.ts`

**新工具函数:**
- 添加: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/utils/format.ts` (如果是格式化)
- 或创建: `/Users/lionad/Github/Run/claude-log-cli/packages/claude/src/utils/[category].ts`

## 特殊目录

**`/packages/claude/dist/`:**
- 用途: TypeScript 编译器输出
- 生成: 是 (由 `tsc` 生成)
- 提交: 否
- 内容: JavaScript 文件、声明文件、源映射

**`/refs/`:**
- 用途: 参考实现
- 生成: 否
- 提交: 是
- 内容: 用于兼容性参考的 C# 实现

**`/.planning/codebase/`:**
- 用途: 代码库文档
- 生成: 否
- 提交: 是
- 内容: 架构和结构文档

---

*结构分析: 2026-02-23*
