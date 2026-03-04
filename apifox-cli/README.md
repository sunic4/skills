# Apifox CLI

Apifox 命令行工具，用于导入同步 OpenAPI/Postman 数据。

## 快速开始

```bash
npx skills add https://github.com/sunic4/apifox-skill
```

### 1. 初始化配置

```bash
apifox init -t YOUR_ACCESS_TOKEN
```

或者不带参数运行，会提示输入 Token：

```bash
apifox init
```

Token 获取方式：Apifox → 个人设置 → 开放 API → 创建访问令牌

### 2. 列出项目

```bash
apifox list-projects
```

### 3. 同步项目

同步为独立的接口文档（每个接口一个 .md 文件）：

```bash
apifox sync -p PROJECT_ID
```

### 4. 导入项目

从 OpenAPI/Swagger 导入：

```bash
apifox import-openapi -p PROJECT_ID -u https://api.example.com/openapi.json
apifox import-openapi -p PROJECT_ID -f ./openapi.json
```

从 Postman Collection 导入：

```bash
apifox import-postman -p PROJECT_ID -f ./collection.json
```

## 命令详解

### init

初始化配置文件，创建 `.apifox` 目录和 `.env` 文件。

```bash
apifox init [options]
```

**选项：**

| 参数 | 简写 | 说明 |
|------|------|------|
| --token | -t | Apifox 访问令牌 |

### list-projects

列出所有 Apifox 项目。

```bash
apifox list-projects [options]
```

**选项：**

| 参数 | 简写 | 说明 |
|------|------|------|
| --token | -t | Apifox 访问令牌（可省略，已配置） |

### sync

同步 Apifox 项目为 OpenAPI 格式。

```bash
apifox sync -p PROJECT_ID [options]
```

**选项：**

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| --project-id | -p | 项目 ID（必需） | - |
| --token | -t | 访问令牌 | 配置文件中 |
| --output | -o | 输出文件路径 | .apifox/{projectId}/ |
| --oas-version | - | OpenAPI 版本 | 3.1 |
| --include-apifox-extensions | - | 包含 Apifox 扩展字段 | false |
| --add-folders-to-tags | - | 将目录添加到标签 | false |
| --scope | - | 同步范围 | ALL |
| --branch-id | - | 分支 ID | - |
| --module-id | - | 模块 ID | - |

**scope 选项：**

- `ALL` - 全部接口
- `SELECTED_ENDPOINTS` - 选中的接口
- `SELECTED_TAGS` - 选中的标签
- `SELECTED_FOLDERS` - 选中的目录

### import-openapi

导入 OpenAPI/Swagger 数据到 Apifox 项目。

```bash
apifox import-openapi -p PROJECT_ID [options]
```

**选项：**

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| --project-id | -p | 项目 ID（必需） | - |
| --token | -t | 访问令牌 | 配置文件中 |
| --url | -u | OpenAPI URL 地址 | - |
| --file | -f | OpenAPI 文件路径 | - |
| --string | -s | OpenAPI JSON/YAML 字符串 | - |
| --endpoint-folder-id | - | 目标接口目录 ID | - |
| --schema-folder-id | - | 目标数据模型目录 ID | - |
| --endpoint-overwrite-behavior | - | 接口覆盖行为 | OVERWRITE_EXISTING |
| --schema-overwrite-behavior | - | 数据模型覆盖行为 | OVERWRITE_EXISTING |
| --branch-id | - | 分支 ID | - |
| --module-id | - | 模块 ID | - |
| --delete-unmatched | - | 删除不匹配的资源 | false |

**overwrite-behavior 选项：**

- `OVERWRITE_EXISTING` - 覆盖已存在
- `SKIP_EXISTING` - 跳过已存在
- `RENAME_EXISTING` - 重命名已存在

### import-postman

导入 Postman Collection 数据到 Apifox 项目。

```bash
apifox import-postman -p PROJECT_ID -f FILE [options]
```

**选项：**

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| --project-id | -p | 项目 ID（必需） | - |
| --token | -t | 访问令牌 | 配置文件中 |
| --file | -f | Postman Collection 文件路径（必需） | - |
| --endpoint-folder-id | - | 目标接口目录 ID | - |
| --endpoint-overwrite-behavior | - | 接口覆盖行为 | OVERWRITE_EXISTING |
| --endpoint-case-overwrite-behavior | - | 接口用例覆盖行为 | OVERWRITE_EXISTING |
| --branch-id | - | 分支 ID | - |
| --module-id | - | 模块 ID | - |

## 目录结构

```
项目根目录/
├── .apifox/                      # 配置和同步目录
│   ├── .env                      # API Token 配置
│   ├── guidelines‌.md                    # 项目接口索引
    └── {projectId}/              # 项目目录
      ├── {md5}.md              # 接口文档（按 URL MD5 命名）
      └── ...
```

## 环境变量

在 `.apifox/.env` 文件中配置：

```bash
APIFOX_TOKEN=your_access_token
```

## 依赖

- Node.js 18+
- TypeScript

## 构建

```bash
npm install
npm run build
```

## License

MIT

