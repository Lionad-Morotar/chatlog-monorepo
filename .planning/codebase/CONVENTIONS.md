# 编码规范

**分析日期:** 2026-02-23

## 命名模式

**文件:**
- TypeScript 源文件使用 camelCase: `cli.ts`、`commandRouter.ts`、`sessionParser.ts`
- Barrel 文件使用 `index.ts` 进行干净的重新导出
- 工具文件按用途命名: `format.ts`

**函数:**
- 所有函数使用 camelCase: `parseOptions()`、`findProjectDir()`、`formatBytes()`
- 私有辅助函数以下划线为前缀或局部作用域
- 生成器函数使用标准命名: `readJsonlLines()`

**变量:**
- 所有变量使用 camelCase: `opts`、`projectDir`、`toolCounts`
- 复杂对象使用描述性名称: `session`、`entry`、`messages`
- 迭代器使用单字母: `i`、`s`、`msg`

**类型:**
- 接口和类型使用 PascalCase: `SessionSummary`、`CommandOptions`、`OutputFormat`
- 带后缀的描述性接口名称: `SessionSummary`、`SessionMessage`
- 枚举值使用 PascalCase: `OutputFormat.Table`、`OutputFormat.Json`

**类:**
- 类名使用 PascalCase: `JsonFormatter`、`TableFormatter`
- 实现接口模式: `implements OutputFormatter`

## 代码风格

**格式化:**
- 未检测到显式格式化器配置 (无 .prettierrc、.editorconfig)
- 始终使用 2 空格缩进
- 需要分号
- 字符串使用单引号

**代码检查:**
- 代码中存在 ESLint 注释: `// eslint-disable-next-line no-console`
- 允许控制台使用但每行显式禁用
- 未检测到 eslint 配置文件

**TypeScript 严格性:**
- `tsconfig.json` 中启用严格模式: `"strict": true`
- 导出函数显式返回类型
- 函数参数类型注解
- 需要空检查: 常见 `if (!projectDir)` 模式

## 导入组织

**顺序:**
1. Node.js 内置优先: `import fs from 'node:fs'`
2. 内部模块: `import type { SessionSummary } from '../models'`
3. 同目录导入最后

**模式:**
- 内置模块使用 `node:` 前缀
- 类型导入使用 `import type` 语法
- Barrel 文件重新导出子目录

**路径别名:**
- 未配置路径别名
- 使用相对导入: `../models`、`./output`

## 错误处理

**模式:**
- 解析错误使用静默忽略的 try-catch:
  ```typescript
  try {
    const entry = JSON.parse(line) as JsonlEntry;
  } catch {
    // 跳过格式错误的行
  }
  ```
- 错误对象转换为字符串: `err instanceof Error ? err.message : String(err)`
- 进程以错误码退出: `process.exit(1)`
- 验证提前返回错误消息

**错误消息:**
- 用户友好的消息: `'No Claude Code sessions found. Use --path to specify a project directory.'`
- 错误文本中建议纠正措施

## 日志

**框架:** 直接使用控制台

**模式:**
- 所有控制台访问都带有 eslint-disable 标记
- 控制台用于所有输出 (CLI 工具)
- 错误输出到 stderr: `console.error()`
- 标准输出到 stdout: `console.log()`

**ANSI 颜色:**
- 终端颜色的手动 ANSI 转义码:
  ```typescript
  const roleColor = msg.role === 'user' ? '\x1b[36m' : '\x1b[33m';
  const reset = '\x1b[0m';
  ```

## 注释

**何时注释:**
- 解释不明显的行为: `// Match legacy C# behavior: order by Created ascending`
- 记录有意跳过: `// Skip malformed lines`
- 阐明复杂逻辑: `// For search, the positional becomes the query`

**注释风格:**
- 单行注释在 `//` 后带空格
- 注释位于所描述代码之前
- 未检测到 JSDoc/TSDoc

## 函数设计

**大小:**
- 函数范围从 2 行到约 50 行
- `commandRouter.ts` 有较长函数 (最多 50 行)
- `sessionParser.ts` 函数平均 20-30 行

**参数:**
- 多参数使用选项对象: `CommandOptions`
- 不大量使用解构
- 函数签名中的默认值: `userOnly = false`

**返回值:**
- 声明显式返回类型
- 未找到时返回 null: `return null`
- 退出码作为数字: `return 0`、`return 1`

## 模块设计

**导出:**
- 首选命名导出: `export function`、`export interface`
- Barrel 文件聚合和重新导出
- 公共 API 在 `index.ts` 中定义

**Barrel 文件:**
- `packages/claude/src/index.ts`: 重新导出模型和服务
- `packages/claude/src/output/index.ts`: 格式化器的工厂函数

**内部与公共:**
- 公共 API 表面最小: 仅模型和 sessionParser
- 内部模块按功能组织
- CLI 逻辑隔离在 `cli.ts` 和 `commandRouter.ts`

## 特殊模式

**生成器函数:**
- 用于逐行文件读取:
  ```typescript
  function* readJsonlLines(jsonlPath: string): Generator<string> {
    const data = fs.readFileSync(jsonlPath, 'utf8');
    const lines = data.split(/\r?\n/);
    for (const line of lines) yield line;
  }
  ```

**类型守卫:**
- 使用 `typeof` 和 `Array.isArray()` 进行运行时类型检查
- 验证后显式转换: `JSON.parse(line) as JsonlEntry`

**遗留兼容性:**
- 注释引用匹配"遗留 C# 行为"
- 日期格式化匹配先前实现

---

*规范分析: 2026-02-23*
