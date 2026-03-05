import { ensureToken } from './auth';
import { projectDb, openapiDb } from './db';
import { ApifoxClient } from './client';
import { Project, ProjectListItem, OpenApi } from './types';

export type FindResult = OpenApi[]

type OpenApiMethodDetailMap = Record<string, { summary?: string }>;
type OpenApiPathMap = Record<string, OpenApiMethodDetailMap>;

function toProject(item: ProjectListItem): Project {
  return {
    id: item.id,
    name: item.name,
    teamId: item.teamId,
    description: item.description || '',
    roleType: item.roleType || 0,
    visibility: item.visibility || 'private',
    type: item.type || 'HTTP',
    hasPublicDocsSite: item.hasPublicDocsSite || false,
  };
}

export async function sync() {
  const token = await ensureToken();
  const client = new ApifoxClient({ token });
  const response = await client.getProjectList();
  const items: ProjectListItem[] = response.data || [];

  for (const item of items) {
    const project = toProject(item);
    await projectDb.upsert(project);
  }

  for (const project of items) {
    try {
      const data = await client.getOpenApiBy(project.id);
      const paths: OpenApiPathMap = data?.paths || {};
      for (const [apiPath, methods] of Object.entries(paths)) {
        for (const [method, detail] of Object.entries(methods)) {
          const openapi: OpenApi = {
            projectId: project.id,
            url: apiPath,
            name: detail.summary || '',
            method: method.toUpperCase(),
            json: JSON.stringify(detail),
          };
          await openapiDb.upsert(openapi);
        }
      }
    } catch (error: any) {
      console.log(`x Synced project: ${project.name} `, error?.message);
    }
    console.log(`✓ Synced project: ${project.name}`);
  }
}


export async function find(keyword: string): Promise<OpenApi[]> {
  if (!keyword || keyword.trim() === '') {
    console.error('Error: keyword is required');
    process.exit(1);
  }
  const projects = await projectDb.findAll();
  if (projects.length <= 0) {
    await sync();
  }
  const results: OpenApi[] = await openapiDb.findByKeyword(keyword)
  return results;
}
