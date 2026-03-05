---
name: apifox
description: 使用 apifox 查询接口文档。用户提到 apifox、对接接口、查看接口文档、同步接口等情况使用此技能。
---

# apifox
严格按以下流程执行，禁止读取 `~/.apifox/.env` 文件内容：
- 用户要求同步时,不需要用户确认
- 查询结果会在终端打印
- 使用此技能时不需要查看其他文件
- 若同步或查询失败，先检查网络与 CLI 是否可用，再重试一次
- 若查询没有结果,由用户决定是否同步后再次查询

## When to use
当用户需要查询apifox接口时使用该技能

## Instructions

### 1. 同步项目（可选）
```bash
npx @sunic/skills-apifox-cli sync
```

### 2. 搜索接口
```bash
npx @sunic/skills-apifox-cli find <关键字>
```
