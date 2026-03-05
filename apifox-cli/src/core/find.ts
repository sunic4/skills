import { ensureToken } from './auth';
import { projectDb, openapiDb } from './db';
import { ApifoxClient } from './client';
import { Project, ProjectListItem, OpenApi } from './types';
import * as crypto from 'crypto';

export type FindResult = OpenApi[]


export async function sync() {
  const token = await ensureToken();
  const client = new ApifoxClient({ token });
  const response = await client.getProjectList();
  const items: ProjectListItem[] = response.data || [];
  for (const item of items) {
    const project: Project = {
      id: item.id,
      name: item.name,
      teamId: item.teamId,
      description: item.description || '',
      roleType: item.roleType || 0,
      visibility: item.visibility || 'private',
      type: item.type || 'HTTP',
      hasPublicDocsSite: item.hasPublicDocsSite || false,
    };
    projectDb.upsert(project);
  }
  for (const item of items) {
    const data = await client.getOpenApiBy(item.id);
    const paths = data?.paths || {};
    for (const [apiPath, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods as Record<string, any>)) {
        const urlMd5 = crypto.createHash('md5').update(apiPath).digest('hex');
        const openapi: OpenApi = {
          projectId: item.id,
          url: urlMd5,
          name: details.summary || details.operationId || apiPath,
          method: method.toUpperCase(),
          json: JSON.stringify(details),
        };
        openapiDb.upsert(openapi);
      }
    }
    console.log(`✓ Synced project: ${item.name}`);
  }
}


export async function find(keyword: string): Promise<OpenApi[]> {
  if (!keyword || keyword.trim() === '') {
    console.error('Error: keyword is required');
    process.exit(1);
  }
  const projects = projectDb.findAll();
  if (projects.length <= 0) {
    await sync();
  }
  const results: OpenApi[] = openapiDb.findByKeyword(keyword)
  return results;
}
