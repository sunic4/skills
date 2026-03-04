import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function getCliName(): string {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf('--name');
  if (nameIndex !== -1 && args[nameIndex + 1]) {
    return args[nameIndex + 1];
  }
  throw new Error('Please provide --name parameter');
}

function buildCli(cliName: string): void {
  const rootDir = path.resolve(__dirname, '..');
  const cliDir = path.join(rootDir, `${cliName}-cli`);
  const targetDir = path.join(rootDir, cliName, 'scripts');

  if (!fs.existsSync(cliDir)) {
    throw new Error(`CLI directory not found: ${cliDir}`);
  }

  const distDir = path.join(cliDir, 'dist');

  console.log(`Building ${cliName}-cli...`);

  const nodeModulesDir = path.join(cliDir, 'node_modules');
  if (!fs.existsSync(nodeModulesDir)) {
    console.log('Installing dependencies...');
    execSync('pnpm install', { cwd: cliDir, stdio: 'inherit' });
  }

  console.log('Running build...');
  execSync('pnpm run build', { cwd: cliDir, stdio: 'inherit' });

  if (!fs.existsSync(distDir)) {
    throw new Error(`Dist directory not found after build: ${distDir}`);
  }

  fs.cpSync(distDir, targetDir, { recursive: true });

  fs.renameSync(path.join(targetDir, 'index.js'), path.join(targetDir, 'cli.js'))
  console.log(`Successfully copied dist to ${targetDir}`);
}

const cliName = getCliName();
buildCli(cliName);
