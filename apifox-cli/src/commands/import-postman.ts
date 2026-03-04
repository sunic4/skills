import * as fs from 'fs';
import { ApifoxClient } from '../client';

interface ImportPostmanOptions {
  projectId: string;
  token: string;
  file: string;
  endpointFolderId?: string;
  endpointOverwriteBehavior?: string;
  endpointCaseOverwriteBehavior?: string;
  branchId?: string;
  moduleId?: string;
  output?: string;
}

export async function importPostman(options: ImportPostmanOptions): Promise<void> {
  const client = new ApifoxClient({ token: options.token });

  if (!options.file) {
    console.error('Error: Please provide --file option');
    process.exit(1);
  }

  let input: string;
  try {
    const fileContent = fs.readFileSync(options.file, 'utf-8');
    JSON.parse(fileContent);
    input = fileContent;
  } catch (error: any) {
    console.error(`Error reading or parsing Postman collection file: ${error.message}`);
    process.exit(1);
  }

  const importOptions: any = {};

  if (options.endpointFolderId) {
    importOptions.targetEndpointFolderId = parseInt(options.endpointFolderId, 10);
  }
  if (options.endpointOverwriteBehavior) {
    importOptions.endpointOverwriteBehavior = options.endpointOverwriteBehavior;
  }
  if (options.endpointCaseOverwriteBehavior) {
    importOptions.endpointCaseOverwriteBehavior = options.endpointCaseOverwriteBehavior;
  }
  if (options.branchId) {
    importOptions.targetBranchId = parseInt(options.branchId, 10);
  }
  if (options.moduleId) {
    importOptions.moduleId = parseInt(options.moduleId, 10);
  }

  console.log(`Importing Postman Collection to project ${options.projectId}...`);

  try {
    const result = await client.importPostman(options.projectId, input, importOptions);
    
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
      console.log(`  Endpoint Folders Created: ${data.counters.endpointFolderCreated || 0}`);
      console.log(`  Endpoint Folders Updated: ${data.counters.endpointFolderUpdated || 0}`);
      console.log(`  Endpoint Cases Created: ${data.counters.endpointCaseCreated || 0}`);
      console.log(`  Endpoint Cases Updated: ${data.counters.endpointCaseUpdated || 0}`);
    }
  } catch (error: any) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
}
