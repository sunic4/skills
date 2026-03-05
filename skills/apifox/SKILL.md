---
name: apifox
description: 使用 apifox 搜索接口内容。用户提到 apifox、对接接口、查看接口文档等使用此技能。
---

# apifox
严格按以下流程执行，禁止读取 `~/.apifox/.env` 文件内容：
- 由用户决定是否需要同步
- 查询的信息,会再终端打印

## When to use
当用户需要对接或查询接口时使用该技能

## Instructions

### 1. 同步项目
```bash
npx @sunic/skills-apifox-cli sync
```

### 2. 搜索接口
```bash
npx @sunic/skills-apifox-cli find <关键字>
```

