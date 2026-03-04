---
name: apifox
description: Apifox CLI 工具，通过命令同步接口文档。
---

# apifox

- 禁止读取和修改```.apifox/.env```文件
- 需要初始化时,提示用户配置 ```.apifox/.env```
- 优先查找缓存,必要时通过指令同步


## When to use
当用户需要对接或查询接口时使用该技能

## Instructions

### 1. 初始化配置

```bash
node scripts/cli.js init
```

提示配置.apifox/.env

### 2. 列出项目

```bash
node scripts/cli.js list-projects
```

### 3. 同步项目

同步为 OpenAPI 格式：

```bash
node scripts/cli.js sync -p PROJECT_ID
```
### 4. 缓存目录

项目根目录/
├── .apifox/                      # 配置和同步目录
    ├── .env                      # API Token 配置
    ├── guidelines.md             # 项目接口索引
    ├── projects.md              # 项目列表
    └── {projectId}/             # 项目目录
        ├── {md5}.md              # 接口文档（按 URL MD5 命名）
