import * as fs from 'fs';
import { ApifoxClient } from '../client';

interface ImportOptions {
  projectId: string;
  token: string;
  url?: string;
  file?: string;
  string?: string;
  endpointFolderId?: string;
  schemaFolderId?: string;
  endpointOverwriteBehavior?: string;
  schemaOverwriteBehavior?: string;
  branchId?: string;
  moduleId?: string;
  deleteUnmatched?: boolean;
  output?: string;
}

export async function importOpenApi(options: ImportOptions): Promise<void> {
  const client = new ApifoxClient({ token: options.token });

  let input: any;

  if (options.url) {
    input = { url: options.url };
  } else if (options.file) {
    const fileContent = fs.readFileSync(options.file, 'utf-8');
    input = fileContent;
  } else if (options.string) {
    input = options.string;
  } else {
    console.error('Error: Please provide either --url, --file, or --string option');
    process.exit(1);
  }

  const importOptions: any = {};

  if (options.endpointFolderId) {
    importOptions.targetEndpointFolderId = parseInt(options.endpointFolderId, 10);
  }
  if (options.schemaFolderId) {
    importOptions.targetSchemaFolderId = parseInt(options.schemaFolderId, 10);
  }
  if (options.endpointOverwriteBehavior) {
    importOptions.endpointOverwriteBehavior = options.endpointOverwriteBehavior;
  }
  if (options.schemaOverwriteBehavior) {
    importOptions.schemaOverwriteBehavior = options.schemaOverwriteBehavior;
  }
  if (options.branchId) {
    importOptions.targetBranchId = parseInt(options.branchId, 10);
  }
  if (options.moduleId) {
    importOptions.moduleId = parseInt(options.moduleId, 10);
  }
  if (options.deleteUnmatched) {
    importOptions.deleteUnmatchedResources = options.deleteUnmatched;
  }

  console.log(`Importing OpenAPI to project ${options.projectId}...`);

  try {
    const result = await client.importOpenApi(options.projectId, input, importOptions);
    
    console.log('\nImport Result:');
    console.log(JSON.stringify(result, null, 2));

    if (options.output) {
      fs.writeFileSync(options.output, JSON.stringify(result, null, 2));
      console.log(`\nResult saved to ${options.output}`);
    }

    const data = result.data || result;
    if (data.counters) {
      console.log('\nSummary:');
      console.log(`  Endpoints Created: ${data.counters.endpointCreated || 0}`);
      console.log(`  Endpoints Updated: ${data.counters.endpointUpdated || 0}`);
      console.log(`  Endpoints Failed: ${data.counters.endpointFailed || 0}`);
      console.log(`  Endpoints Ignored: ${data.counters.endpointIgnored || 0}`);
      console.log(`  Schemas Created: ${data.counters.schemaCreated || 0}`);
      console.log(`  Schemas Updated: ${data.counters.schemaUpdated || 0}`);
    }
  } catch (error: any) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
}
