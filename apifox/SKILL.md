---
name: apifox
description: 使用 apifox CLI 初始化本地配置、列出项目、同步项目接口文档并缓存到 .apifox 目录。用户提到 Apifox、接口文档同步、OpenAPI 导出、项目列表查询、guidelines 缓存时使用本技能。
---

# apifox
严格按以下流程执行，禁止读取 `.apifox/.env` 文件内容：
1. 仅做存在性检查（不可读取或打印内容）以确认 `.apifox/.env` 是否存在。
2. 不存在时执行初始化命令，然后停止后续同步动作，提示用户手动填写 `.apifox/.env` 中的 `APIFOX_TOKEN`。
3. 存在时检查 `.apifox/guidelines.md` 是否已有目标项目缓存（以项目 ID 或名称在文件中出现为准）。
4. 无缓存时执行 `sync -p PROJECT_ID`，同步后再次检查缓存是否生成。
5. 若同步出现权限不足（如 401/403/permission denied），将失败项目记录到 `.apifox/projects.md` 的“权限异常”区域，跳过当前项目并继续下一个项目（如存在批量项目场景）。
   记录格式示例：
   - 项目ID: <PROJECT_ID> | 名称: <PROJECT_NAME> | 错误: <ERROR_SUMMARY>

注意：缓存索引文件名必须是 `.apifox/guidelines.md`，不要使用包含隐藏字符或 BOM 的文件名；以路径字节匹配为准。

## When to use
当用户需要对接或查询接口时使用该技能

## Instructions

### 1. 初始化配置

```bash
npx github:sunic4/skills/apifox-cli#main init
```

`提示配置 .apifox/.env`

### 2. 列出项目

```bash
npx github:sunic4/skills/apifox-cli#main list-projects
```

### 3. 同步项目

同步为 OpenAPI 格式：

```bash
npx github:sunic4/skills/apifox-cli#main sync -p PROJECT_ID
```
### 4. 缓存目录

项目根目录/
├── .apifox/                      # 配置和同步目录
    ├── .env                      # API Token 配置
    ├── guidelines.md             # 项目接口索引
    ├── projects.md              # 项目列表
    └── {projectId}/             # 项目目录
        ├── {md5}.md              # 接口文档（按 URL MD5 命名）
