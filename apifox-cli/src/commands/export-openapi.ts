import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { ApifoxClient } from '../client';
import { ensureProjectDir, loadConfig } from '../config';

interface ExportOptions {
  projectId: string;
  token: string;
  output: string;
  oasVersion?: string;
  format?: string;
  includeApifoxExtensions?: boolean;
  addFoldersToTags?: boolean;
  scope?: string;
  branchId?: string;
  moduleId?: string;
}

export async function exportOpenApi(options: ExportOptions): Promise<void> {
  const client = new ApifoxClient({ token: options.token });

  const exportOptions: any = {
    scope: {
      type: options.scope || 'ALL',
    },
    options: {
      includeApifoxExtensionProperties: options.includeApifoxExtensions || false,
      addFoldersToTags: options.addFoldersToTags || false,
    },
    oasVersion: options.oasVersion || '3.1',
    exportFormat: options.format || 'JSON',
  };

  if (options.branchId) {
    exportOptions.branchId = parseInt(options.branchId, 10);
  }
  if (options.moduleId) {
    exportOptions.moduleId = parseInt(options.moduleId, 10);
  }

  const projectDir = ensureProjectDir(options.projectId);

  console.log(`Exporting OpenAPI from project ${options.projectId}...`);

  try {
    const openapiData = await client.exportOpenApi(options.projectId, exportOptions);
    
    const projectTitle = openapiData?.info?.title || options.projectId;
    console.log(`Project: ${projectTitle}`);
    console.log(`Exporting APIs to individual .md files...`);

    const apiList = exportApisToMdFiles(openapiData, projectDir);
    
    console.log(`\nExported ${apiList.length} APIs successfully`);

    updateMapFile(options.projectId, projectTitle, projectDir, apiList);
  } catch (error: any) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

function updateMapFile(projectId: string, projectTitle: string, projectDir: string, apiList: ApiInfo[]): void {
  const config = loadConfig();
  const mapFilePath = path.join(config.baseDir, 'guidelines‌.md');
  
  let content = '';
  if (fs.existsSync(mapFilePath)) {
    content = fs.readFileSync(mapFilePath, 'utf-8');
  }

  const existingPattern = new RegExp(`^## ${projectId}[^*]*\\*[^*]+\\*[\\s\\S]*?(?=^## |$)`, 'm');
  
  const groupedApis = new Map<string, ApiInfo[]>();
  for (const api of apiList) {
    const key = api.summary;
    if (!groupedApis.has(key)) {
      groupedApis.set(key, []);
    }
    groupedApis.get(key)!.push(api);
  }

  let newEntry = `## ${projectId} - ${projectTitle}\n* Last updated: ${new Date().toISOString().split('T')[0]} *\n`;
  const dirName = path.basename(projectDir);
  
  for (const [summary, apis] of groupedApis) {
    const descriptions = [...new Set(apis.map(a => a.description).filter(d => d))];
    const description = descriptions.length > 0 ? descriptions[0] : '';
    
    newEntry += `\n### ${summary}\n`;
    if (description) {
      newEntry += `${description}\n`;
    }
    for (const api of apis) {
      newEntry += `- [${api.method} ${api.path}](./${dirName}/${api.fileName})\n`;
    }
  }
  
  if (existingPattern.test(content)) {
    content = content.replace(existingPattern, newEntry.trim());
  } else {
    if (content.endsWith('\n')) {
      content += newEntry;
    } else {
      content += '\n' + newEntry;
    }
  }

  fs.writeFileSync(mapFilePath, content, 'utf-8');
  console.log(`Map updated: ${mapFilePath}`);
}

interface ApiInfo {
  method: string;
  path: string;
  fileName: string;
  summary: string;
  description: string;
}

function exportApisToMdFiles(openapiData: any, projectDir: string): ApiInfo[] {
  const apiList: ApiInfo[] = [];
  const paths = openapiData?.paths || {};
  
  for (const [apiPath, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods as Record<string, any>)) {
      if (method === 'parameters' || method === 'summary' || method === 'description') {
        continue;
      }
      
      const op = operation as any;
      const summary = op.summary || op.operationId || apiPath;
      const description = op.description || '';
      const parameters = op.parameters || [];
      const requestBody = op.requestBody;
      const responses = op.responses || {};
      const tags = op.tags || [];
      
      const urlKey = `${method.toUpperCase()} ${apiPath}`;
      const md5Hash = crypto.createHash('md5').update(urlKey).digest('hex');
      const fileName = `${md5Hash}.md`;
      const filePath = path.join(projectDir, fileName);
      
      let mdContent = `# ${summary}\n\n`;
      mdContent += `**URL:** ${method.toUpperCase()} ${apiPath}\n\n`;
      
      if (description) {
        mdContent += `## Description\n\n${description}\n\n`;
      }
      
      if (tags.length > 0) {
        mdContent += `**Tags:** ${tags.join(', ')}\n\n`;
      }
      
      if (parameters.length > 0) {
        mdContent += `## Parameters\n\n`;
        mdContent += `| Name | In | Type | Required | Description |\n`;
        mdContent += `|------|-----|------|----------|-------------|\n`;
        for (const param of parameters) {
          const required = param.required ? 'Yes' : 'No';
          const paramType = param.schema?.type || 'string';
          mdContent += `| ${param.name} | ${param.in} | ${paramType} | ${required} | ${param.description || '-'} |\n`;
        }
        mdContent += `\n`;
      }
      
      if (requestBody) {
        mdContent += `## Request Body\n\n`;
        const content = requestBody.content || {};
        for (const [contentType, mediaType] of Object.entries(content)) {
          mdContent += `**Content-Type:** ${contentType}\n\n`;
          const schema = (mediaType as any)?.schema;
          if (schema) {
            mdContent += `\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\n`;
          }
        }
      }
      
      if (Object.keys(responses).length > 0) {
        mdContent += `## Responses\n\n`;
        for (const [statusCode, response] of Object.entries(responses)) {
          const resp = response as any;
          mdContent += `### ${statusCode} ${resp.description || ''}\n\n`;
          const content = resp.content || {};
          for (const [contentType, mediaType] of Object.entries(content)) {
            mdContent += `**Content-Type:** ${contentType}\n\n`;
            const schema = (mediaType as any)?.schema;
            if (schema) {
              mdContent += `\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\n`;
            }
          }
        }
      }
      
      fs.writeFileSync(filePath, mdContent, 'utf-8');
      
      apiList.push({
        method: method.toUpperCase(),
        path: apiPath,
        fileName,
        summary,
        description
      });
    }
  }
  
  return apiList;
}
