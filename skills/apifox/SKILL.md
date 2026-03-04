---
name: apifox
description: 使用 apifox CLI 初始化本地配置、列出项目、同步项目接口文档并缓存到 .apifox 目录。用户提到 Apifox、接口文档同步、OpenAPI 导出、项目列表查询、guidelines 缓存时使用本技能。
---

# apifox
严格按以下流程执行，禁止读取 `.apifox/.env` 文件内容：
1. 当指令提示`请修改 .apifox/.env 文件中的 APIFOX_TOKEN 为你的访问令牌` 时,直接提示,等待确认后执行。
2. 优先查找`.apifox/guidelines.md`, 是否已有目标项目缓存（以项目 ID 或名称在文件中出现为准）。
3. 若未命中缓存，再使用接口路径关键字在 `.apifox/**` 中检索是否已有接口文档（优先避免重复同步）。
4. 仍无结果时执行 `sync -p PROJECT_ID`，同步后再次检查缓存是否生成。
5. 若同步出现权限不足（如 401/403/permission denied），将失败项目记录到 `.apifox/projects.md` 的"权限异常"区域，跳过当前项目并继续下一个项目（如存在批量项目场景）。
   记录格式示例：
   - 项目ID: <PROJECT_ID> | 名称: <PROJECT_NAME> | 错误: <ERROR_SUMMARY>

注意：缓存索引文件名必须是 `.apifox/guidelines.md`，不要使用包含隐藏字符或 BOM 的文件名；以路径字节匹配为准。
注意：执行命令时不要拼接 `undefined` 之类的占位参数，必须只传真实参数。

## When to use
当用户需要对接或查询接口时使用该技能

## Instructions

### 1. 列出项目

```bash
npx @sunic/skills-apifox-cli list-projects
```

### 2. 同步项目

```bash
npx @sunic/skills-apifox-cli sync -p PROJECT_ID
```
同步后在 `.apifox/{projectId}/` 中检索目标接口路径（URL 关键字）以定位具体文档。
### 3. 缓存目录

项目根目录/
├── .apifox/                      # 配置和同步目录
    ├── .env                      # API Token 配置
    ├── guidelines.md             # 项目接口索引
    ├── projects.md              # 项目列表
    └── {projectId}/             # 项目目录
        ├── {md5}.md              # 接口文档（按 URL MD5 命名）
