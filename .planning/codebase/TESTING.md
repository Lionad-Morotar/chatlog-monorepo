# 测试模式

**分析日期:** 2026-02-23

## 测试框架

**状态:** 未配置测试框架

**检测:**
- 未找到测试文件 (无 `*.test.ts`、`*.spec.ts`)
- 无测试运行器配置 (无 `jest.config.*`、`vitest.config.*`)
- `package.json` 中无测试脚本
- 根目录或包中无测试依赖

**推荐设置:**
鉴于代码库结构，Vitest 将是理想选择 (原生 TypeScript、快速、ESM/CJS 兼容)。

## 测试文件组织

**当前状态:** 不适用 - 无测试存在

**推荐结构:**
测试与源文件并列:
```
packages/claude/src/
├── cli.ts
├── cli.test.ts           # CLI 入口测试
├── commands/
│   ├── commandRouter.ts
│   └── commandRouter.test.ts
├── services/
│   ├── sessionParser.ts
│   └── sessionParser.test.ts
├── output/
│   ├── jsonFormatter.ts
│   ├── jsonFormatter.test.ts
│   ├── tableFormatter.ts
│   └── tableFormatter.test.ts
└── utils/
    ├── format.ts
    └── format.test.ts
```

## 测试结构

**推荐模式:**

**单元测试套件:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { parseSummary, listSessions } from './sessionParser';

describe('sessionParser', () => {
  describe('parseSummary', () => {
    it('should return null for empty files', () => {
      // 测试实现
    });

    it('should parse valid JSONL entries', () => {
      // 测试实现
    });
  });
});
```

**CLI 命令测试:**
```typescript
describe('commandRouter', () => {
  it('should parse command options correctly', () => {
    const args = ['sessions', 'list', '--format', 'json'];
    const opts = parseOptions(args);
    expect(opts.format).toBe(OutputFormat.Json);
  });
});
```

## Mocking

**框架:** 未配置 (推荐使用 Vitest 内置 mocking)

**需要 Mock 的内容:**
- **文件系统操作**: `fs.readFileSync`、`fs.readdirSync`
- **进程**: `process.argv`、`process.cwd()`、`process.exit()`
- **控制台**: `console.log`、`console.error` (验证输出)
- **OS**: `os.homedir()` 用于一致路径

**Mocking 模式:**
```typescript
// 文件系统 mocking
vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
    existsSync: vi.fn(),
    statSync: vi.fn()
  }
}));

// 进程 mocking
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit');
});
```

**不需要 Mock 的内容:**
- 纯工具函数 (测试实际实现)
- 数据转换逻辑
- 类型守卫和验证器

## Fixtures 和 Factories

**测试数据策略:**

**JSONL Fixtures:**
```typescript
// test/fixtures/sample-session.jsonl
const sampleSessionLines = [
  '{"type":"user","timestamp":"2024-01-15T10:30:00Z","gitBranch":"main","cwd":"/project","message":{"role":"user","content":"Hello"}}',
  '{"message":{"role":"assistant","content":"Hi there","model":"claude-3-opus-20240229"}}'
];
```

**Factory 函数:**
```typescript
function createMockSession(overrides?: Partial<SessionSummary>): SessionSummary {
  return {
    sessionId: 'test-uuid-123',
    userMessageCount: 1,
    assistantMessageCount: 1,
    toolUseCount: 0,
    fileSizeBytes: 1024,
    projectPath: '/test/project',
    ...overrides
  };
}
```

**位置:**
- 创建 `packages/claude/test/fixtures/` 存放示例文件
- Factory 函数放在 `*.test.ts` 文件中并列

## 覆盖率

**当前状态:** 未强制执行覆盖率要求

**推荐设置:**
```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

**覆盖率目标:**
- 语句: 80%
- 分支: 75%
- 函数: 85%
- 行: 80%

**覆盖率优先区域:**
1. `sessionParser.ts` - 核心解析逻辑 (最高优先级)
2. `commandRouter.ts` - 命令路由和选项解析
3. `format.ts` - 工具格式化函数
4. `jsonFormatter.ts` / `tableFormatter.ts` - 输出格式化器

## 测试类型

**单元测试:**
- 范围: 单个函数和模块
- 无外部依赖 (mock)
- 快速执行 (每个测试 < 100ms)

**集成测试:**
- 临时目录的文件系统操作
- 完整命令执行路径
- 生成进程的端到端 CLI 测试

**E2E 测试:**
- 当前未实现
- 可测试实际 CLI 执行:
  ```typescript
  import { execSync } from 'node:child_process';

  it('should list sessions', () => {
    const output = execSync('node dist/cli.js sessions list');
    expect(output.toString()).toContain('sessions');
  });
  ```

## 关键测试场景

**sessionParser.ts:**
- 格式错误的 JSONL 行处理
- 缺失文件处理
- 日期解析边界情况
- 从数组中提取工具使用
- 从各种内容类型提取文本

**commandRouter.ts:**
- 所有命令的选项解析
- 会话 ID 解析 (UUID、前缀、索引)
- 缺失会话的错误处理
- 格式选择 (表格 vs JSON)

**Formatters:**
- JSON 输出验证
- 表格格式化对齐
- 日期格式化一致性
- ANSI 颜色码处理

**CLI 入口:**
- 帮助显示
- 错误退出码
- 参数验证

## 测试依赖

**推荐添加:**
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

**运行命令:**
```bash
pnpm test              # 运行所有测试
pnpm test --watch      # 监视模式
pnpm test:coverage     # 覆盖率报告
```

---

*测试分析: 2026-02-23*
