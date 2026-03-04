import * as fs from 'fs';
import * as path from 'path';
import { ApifoxClient } from '../client';

interface ListProjectsOptions {
  token: string;
  output?: string;
}

export async function listProjects(options: ListProjectsOptions): Promise<void> {
  const client = new ApifoxClient({ token: options.token });

  console.log('Fetching projects...\n');

  try {
    const result = await client.listProjects();
    
    const items = result.data?.list || result.data || [];
    
    if (items.length === 0) {
      console.log('No projects found.');
      return;
    }

    console.log(`Total projects: ${items.length}\n`);
    console.log('Projects:');
    console.log('-'.repeat(80));
    
    const projectLines: string[] = [];
    for (const project of items) {
      const line = `ID:       ${project.id}\nName:     ${project.name}\nType:     ${project.type || 'api'}\nStatus:   ${project.status === 1 ? 'Published' : 'Draft'}\nCreated:  ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}`;
      console.log(line);
      console.log('-'.repeat(80));
      projectLines.push(line);
    }

    if (options.output) {
      const outputDir = path.dirname(options.output);
      if (outputDir && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const content = `## Apifox 项目列表\n\n更新时间: ${new Date().toLocaleString()}\n\n共 ${items.length} 个项目\n\n---\n\n${projectLines.join('\n\n---\n\n')}`;
      fs.writeFileSync(options.output, content, 'utf-8');
      console.log(`\n项目列表已保存到: ${options.output}`);
    }
  } catch (error: any) {
    console.error('Failed to fetch projects:', error.message);
    process.exit(1);
  }
}
