import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Project, OpenApi } from './types';

const DB_PATH = path.join(os.homedir(), '.apifox', 'apifox.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    initTables();
  }
  return db;
}

function initTables(): void {
  const database = db!;

  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      teamId INTEGER NOT NULL,
      description TEXT DEFAULT '',
      roleType INTEGER DEFAULT 0,
      visibility TEXT DEFAULT 'private',
      type TEXT DEFAULT 'HTTP',
      hasPublicDocsSite INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS openapis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      url TEXT NOT NULL,
      name TEXT NOT NULL,
      method TEXT DEFAULT '',
      json TEXT DEFAULT '',
      description TEXT DEFAULT '',
      updatedAt TEXT DEFAULT ''
    );
  `);
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export const projectDb = {
  insert(project: Project): number {
    const stmt = getDb().prepare(`
      INSERT INTO projects (id, name, teamId, description, roleType, visibility, type, hasPublicDocsSite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      project.id,
      project.name,
      project.teamId,
      project.description,
      project.roleType,
      project.visibility,
      project.type,
      project.hasPublicDocsSite ? 1 : 0
    );
    return project.id;
  },

  findAll(): Project[] {
    const stmt = getDb().prepare('SELECT * FROM projects ORDER BY id DESC');
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      hasPublicDocsSite: Boolean(row.hasPublicDocsSite)
    }));
  },

  findByProjectId(projectId: number): Project | undefined {
    const stmt = getDb().prepare('SELECT * FROM projects WHERE id = ?');
    const row = stmt.get(projectId) as any;
    if (row) {
      return { ...row, hasPublicDocsSite: Boolean(row.hasPublicDocsSite) };
    }
    return undefined;
  },

  upsert(project: Project): number {
    const existing = projectDb.findByProjectId(project.id);
    if (existing) {
      const stmt = getDb().prepare(`
        UPDATE projects SET name = ?, teamId = ?, description = ?,
        roleType = ?, visibility = ?, type = ?, hasPublicDocsSite = ?
        WHERE id = ?
      `);
      stmt.run(
        project.name,
        project.teamId,
        project.description,
        project.roleType,
        project.visibility,
        project.type,
        project.hasPublicDocsSite ? 1 : 0,
        project.id
      );
      return project.id;
    }
    return projectDb.insert(project);
  },

  delete(projectId: number): void {
    const stmt = getDb().prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(projectId);
  },
};

export const openapiDb = {
  insert(openapi: OpenApi): number {
    const stmt = getDb().prepare(`
      INSERT INTO openapis (projectId, url, name, method, json, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      openapi.projectId,
      openapi.url,
      openapi.name,
      openapi.method,
      openapi.json,
    );
    return result.lastInsertRowid as number;
  },

  findAll(): OpenApi[] {
    const stmt = getDb().prepare('SELECT * FROM openapis ORDER BY id DESC');
    return stmt.all() as OpenApi[];
  },

  findByProjectId(projectId: number): OpenApi[] {
    const stmt = getDb().prepare('SELECT * FROM openapis WHERE projectId = ? ORDER BY id DESC');
    return stmt.all(projectId) as OpenApi[];
  },

  findByKeyword(keyword: string): OpenApi[] {
    const stmt = getDb().prepare(`
      SELECT * FROM openapis 
      WHERE name LIKE ? OR path LIKE ? OR description LIKE ?
      ORDER BY id DESC
    `);
    const pattern = `%${keyword}%`;
    return stmt.all(pattern, pattern, pattern) as OpenApi[];
  },

  upsert(openapi: OpenApi): number {
    const stmt = getDb().prepare(`
      INSERT INTO openapis (projectId, url, name, method, json, description)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(projectId, url) DO UPDATE SET
        name = excluded.name,
        method = excluded.method,
        json = excluded.json,
        description = excluded.description,
        updatedAt = datetime('now')
    `);
    const result = stmt.run(
      openapi.projectId,
      openapi.url,
      openapi.name,
      openapi.method,
      openapi.json,
      openapi.description
    );
    return result.lastInsertRowid as number;
  },

  deleteByProjectId(projectId: number): void {
    const stmt = getDb().prepare('DELETE FROM openapis WHERE projectId = ?');
    stmt.run(projectId);
  },
};
