# Apifox CLI API 文档

## 基础信息

- **Base URL**: `https://api.apifox.com`
- **API Version**: `2024-03-28`
- **Client Version**: `2.8.13-alpha.1`

## 请求头

| Header | 值 |
|--------|-----|
| Content-Type | application/json |
| X-Apifox-Api-Version | 2024-03-28 |
| x-client-version | 2.8.13-alpha.1 |
| Authorization | Bearer {token} |

## 接口列表

### 1. 获取项目列表

**接口地址**: `GET /api/v1/user-projects`

**描述**: 获取用户的所有项目列表

**请求参数**: 无

**响应参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | number | 项目 ID |
| name | string | 项目名称 |
| teamId | number | 团队 ID |
| description | string | 项目描述 |
| ordering | number | 排序 |
| icon | string | 图标 URL |
| roleType | number | 角色类型 |
| visibility | string | 可见性 |
| type | string | 项目类型 |
| hasPublicDocsSite | boolean | 是否有公共文档站点 |

**响应示例**:
```json
{
  "data": [
    {
      "id": 1637520,
      "name": "测试项目",
      "teamId": 1637520,
      "description": "",
      "ordering": 8309343,
      "icon": "https://cdn.apifox.com/app/project-icon/builtin/17.jpg",
      "roleType": 3,
      "visibility": "private",
      "type": "HTTP",
      "hasPublicDocsSite": false
    }
  ]
}
```

---

### 2. 导入 OpenAPI

**接口地址**: `POST /v1/projects/{projectId}/import-openapi`

**描述**: 将 OpenAPI 规范导入到指定项目。当前支持导入 OpenAPI 3、Swagger 2 格式数据。

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| projectId | string | 项目 ID |

**查询参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| locale | string | 语言设置，默认 zh-CN |

**请求体**:
```json
{
  "input": {
    "url": "https://petstore.swagger.io/v2/swagger.json"
    // 或直接传入 OpenAPI JSON/YAML 字符串
  },
  "options": {
    "targetEndpointFolderId": 0,
    "targetSchemaFolderId": 0,
    "endpointOverwriteBehavior": "OVERWRITE_EXISTING",
    "schemaOverwriteBehavior": "OVERWRITE_EXISTING",
    "updateFolderOfChangedEndpoint": false,
    "prependBasePath": false,
    "targetBranchId": 1,
    "moduleId": 1,
    "deleteUnmatchedResources": false
  }
}
```

**请求体参数说明**:
| 参数 | 类型 | 描述 |
|------|------|------|
| input | object \| string | 导入的 OpenAPI 数据，支持 URL 方式或字符串方式 |
| input.url | string | 用来获取 OpenAPI 格式数据的 URL 地址 |
| input.basicAuth | object | 鉴权信息（可选）|
| input.basicAuth.username | string | 用户名 |
| input.basicAuth.password | string | 密码 |
| options.targetEndpointFolderId | number | 存储接口的目标目录 ID |
| options.targetSchemaFolderId | number | 存储数据模型的目标目录 ID |
| options.endpointOverwriteBehavior | string | 接口覆盖行为：OVERWRITE_EXISTING, AUTO_MERGE, KEEP_EXISTING, CREATE_NEW |
| options.schemaOverwriteBehavior | string | 数据模型覆盖行为：OVERWRITE_EXISTING, AUTO_MERGE, KEEP_EXISTING, CREATE_NEW |
| options.updateFolderOfChangedEndpoint | boolean | 导入时是否更新接口目录 ID |
| options.prependBasePath | boolean | 是否将基础路径添加到接口路径中 |
| options.targetBranchId | number | 目标分支 ID |
| options.moduleId | number | 模块 ID |
| options.deleteUnmatchedResources | boolean | 是否删除不匹配的资源 |

---

### 3. 导入 Postman 集合

**接口地址**: `POST /v1/projects/{projectId}/import-postman-collection`

**描述**: 将 Postman 集合导入到指定项目。当前支持导入 Postman Collection v2 格式数据。

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| projectId | string | 项目 ID |

**查询参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| locale | string | 语言设置，默认 zh-CN |

**请求体**:
```json
{
  "input": "{\"info\":{\"name\":\"Sample\",\"description\":\"\",\"schema\":\"https://schema.getpostman.com/json/collection/v2.1.0/collection.json\"},\"item\":[]}",
  "options": {
    "targetEndpointFolderId": 0,
    "endpointOverwriteBehavior": "OVERWRITE_EXISTING",
    "endpointCaseOverwriteBehavior": "OVERWRITE_EXISTING",
    "updateFolderOfChangedEndpoint": false,
    "targetBranchId": 1,
    "moduleId": 1
  }
}
```

**请求体参数说明**:
| 参数 | 类型 | 描述 |
|------|------|------|
| input | string | Postman 项目的 JSON 字符串序列化格式 |
| options.targetEndpointFolderId | number | 存储接口的目标目录 ID |
| options.endpointOverwriteBehavior | string | 接口覆盖行为：OVERWRITE_EXISTING, AUTO_MERGE, KEEP_EXISTING, CREATE_NEW |
| options.endpointCaseOverwriteBehavior | string | 接口用例覆盖行为：OVERWRITE_EXISTING, KEEP_EXISTING, CREATE_NEW |
| options.updateFolderOfChangedEndpoint | boolean | 导入时是否更新接口目录 ID |
| options.targetBranchId | number | 目标分支 ID |
| options.moduleId | number | 模块 ID |

**响应示例**:
```json
{
  "data": {
    "counters": {
      "endpointCreated": 10,
      "endpointUpdated": 0,
      "endpointFailed": 0,
      "endpointIgnored": 0,
      "endpointFolderCreated": 0,
      "endpointFolderUpdated": 0,
      "endpointFolderFailed": 0,
      "endpointFolderIgnored": 0,
      "endpointCaseCreated": 0,
      "endpointCaseUpdated": 0,
      "endpointCaseFailed": 0,
      "endpointCaseIgnored": 0
    },
    "errors": []
  }
}
```

---

### 4. 导出 OpenAPI

**接口地址**: `POST /v1/projects/{projectId}/export-openapi`

**描述**: 从指定项目导出 OpenAPI 规范

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| projectId | string | 项目 ID |

**查询参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| locale | string | 语言设置，默认 zh-CN |

**请求体**:
```json
{
  "scope": {
    "type": "ALL"
  },
  "options": {
    "includeApifoxExtensionProperties": false,
    "addFoldersToTags": false
  },
  "oasVersion": "3.1",
  "exportFormat": "JSON",
  "environmentIds": [1],
  "branchId": 1,
  "moduleId": 1
}
```

**请求体参数说明**:
| 参数 | 类型 | 描述 |
|------|------|------|
| scope | object | 导出范围配置 |
| scope.type | string | 范围类型：ALL, SELECTED_ENDPOINTS, SELECTED_TAGS, SELECTED_FOLDERS |
| scope.selectedEndpointIds | number[] | 选中的接口 ID（当 type 为 SELECTED_ENDPOINTS 时必填）|
| scope.selectedTags | string[] | 选中的标签（当 type 为 SELECTED_TAGS 时必填）|
| scope.selectedFolderIds | number[] | 选中的目录 ID（当 type 为 SELECTED_FOLDERS 时必填）|
| scope.excludedByTags | string[] | 排除的标签 |
| options.includeApifoxExtensionProperties | boolean | 是否包含 Apifox 扩展字段 |
| options.addFoldersToTags | boolean | 是否在标签中包含目录名称 |
| oasVersion | string | OpenAPI 版本：3.0, 3.1, 2.0 |
| exportFormat | string | 导出格式：JSON, YAML |
| environmentIds | number[] | 导出的环境 ID |
| branchId | number | 分支 ID |
| moduleId | number | 模块 ID |

**响应示例**:
```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "示例项目",
    "description": "",
    "version": "1.0.0"
  },
  "tags": [
    { "name": "接口分类" }
  ],
  "paths": {
    "/pet/{petId}": {
      "get": {
        "summary": "查询宠物详情",
        "parameters": [],
        "responses": {}
      }
    }
  },
  "components": {
    "schemas": {}
  },
  "servers": []
}
```
