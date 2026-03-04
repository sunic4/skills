import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  token: string;
  baseDir: string;
}

export function loadConfig(): Config {
  const baseDir = path.resolve(process.cwd(), '.apifox');
  const envFile = path.join(baseDir, '.env');

  let token = '';

  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && key.trim() === 'APIFOX_TOKEN') {
          token = valueParts.join('=').trim();
          break;
        }
      }
    }
  }

  if (!token) {
    throw new Error('Token not found in .apifox/.env file');
  }

  return { token, baseDir };
}

export function getProjectDir(projectId: string): string {
  const config = loadConfig();
  return path.join(config.baseDir, projectId);
}

export function ensureProjectDir(projectId: string): string {
  const config = loadConfig();
  const projectDir = path.join(config.baseDir, projectId);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  return projectDir;
}
