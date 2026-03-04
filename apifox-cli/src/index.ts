#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import { importOpenApi } from './commands/import-openapi.js';
import { importPostman } from './commands/import-postman.js';
import { exportOpenApi } from './commands/export-openapi.js';
import { listProjects } from './commands/list-projects.js';
import { loadConfig, ensureProjectDir } from './config.js';
import { initConfig } from './commands/init.js';

const program = new Command();

program
  .name('apifox')
  .description('Apifox CLI - 导入同步 OpenAPI/Postman 数据')
  .version('1.0.0');

program
  .command('init')
  .description('初始化配置文件')
  .option('-t, --token <token>', 'Apifox 访问令牌')
  .action(async (options) => {
    await initConfig({ token: options.token });
  });

program
  .command('import-openapi')
  .description('导入 OpenAPI/Swagger 数据到 Apifox 项目')
  .requiredOption('-p, --project-id <projectId>', 'Apifox 项目 ID')
  .option('-t, --token <token>', 'Apifox 访问令牌 (或设置在 .apifox/.env 中)')
  .option('-u, --url <url>', 'OpenAPI URL 地址')
  .option('-f, --file <file>', 'OpenAPI 文件路径')
  .option('-s, --string <string>', 'OpenAPI JSON/YAML 字符串')
  .option('--endpoint-folder-id <id>', '目标接口目录 ID')
  .option('--schema-folder-id <id>', '目标数据模型目录 ID')
  .option('--endpoint-overwrite-behavior <behavior>', '接口覆盖行为', 'OVERWRITE_EXISTING')
  .option('--schema-overwrite-behavior <behavior>', '数据模型覆盖行为', 'OVERWRITE_EXISTING')
  .option('--branch-id <id>', '分支 ID')
  .option('--module-id <id>', '模块 ID')
  .option('--delete-unmatched', '删除不匹配的资源', false)
  .option('-o, --output <file>', '输出文件路径')
  .action(async (options) => {
    const token = options.token || loadConfig().token;
    await importOpenApi({ ...options, token });
  });

program
  .command('import-postman')
  .description('导入 Postman Collection 数据到 Apifox 项目')
  .requiredOption('-p, --project-id <projectId>', 'Apifox 项目 ID')
  .option('-t, --token <token>', 'Apifox 访问令牌 (或设置在 .apifox/.env 中)')
  .requiredOption('-f, --file <file>', 'Postman Collection JSON 文件路径')
  .option('--endpoint-folder-id <id>', '目标接口目录 ID')
  .option('--endpoint-overwrite-behavior <behavior>', '接口覆盖行为', 'OVERWRITE_EXISTING')
  .option('--endpoint-case-overwrite-behavior <behavior>', '接口用例覆盖行为', 'OVERWRITE_EXISTING')
  .option('--branch-id <id>', '分支 ID')
  .option('--module-id <id>', '模块 ID')
  .option('-o, --output <file>', '输出文件路径')
  .action(async (options) => {
    const token = options.token || loadConfig().token;
    await importPostman({ ...options, token });
  });

program
  .command('sync')
  .description('同步 Apifox 项目为 OpenAPI/Swagger 格式')
  .requiredOption('-p, --project-id <projectId>', 'Apifox 项目 ID')
  .option('-t, --token <token>', 'Apifox 访问令牌 (或设置在 .apifox/.env 中)')
  .option('-o, --output <file>', '输出文件路径 (默认: .apifox/<projectId>/openapi.json)')
  .option('--oas-version <version>', 'OpenAPI 版本 (2.0, 3.0, 3.1)', '3.1')
  .option('--format <format>', '同步格式 (JSON, YAML)', 'JSON')
  .option('--include-apifox-extensions', '包含 Apifox 扩展字段', false)
  .option('--add-folders-to-tags', '将目录添加到标签', false)
  .option('--scope <scope>', '同步范围 (ALL, SELECTED_ENDPOINTS, SELECTED_TAGS, SELECTED_FOLDERS)', 'ALL')
  .option('--branch-id <id>', '分支 ID')
  .option('--module-id <id>', '模块 ID')
  .action(async (options) => {
    const config = loadConfig();
    const token = options.token || config.token;
    
    let outputPath = options.output;
    if (!outputPath) {
      const projectDir = ensureProjectDir(options.projectId);
      const ext = options.format?.toLowerCase() === 'yaml' ? 'yaml' : 'json';
      outputPath = `${projectDir}/openapi.${ext}`;
    }
    
    await exportOpenApi({ ...options, token, output: outputPath });
  });

program
  .command('list-projects')
  .description('列出所有 Apifox 项目')
  .option('-t, --token <token>', 'Apifox 访问令牌 (或设置在 .apifox/.env 中)')
  .option('-o, --output <file>', '输出文件路径 (默认: .apifox/projects.md)')
  .action(async (options) => {
    const config = loadConfig();
    const token = options.token || config.token;
    let outputPath = options.output;
    if (!outputPath) {
      outputPath = path.join(config.baseDir, 'projects.md');
    }
    await listProjects({ token, output: outputPath });
  });

program.parse();
