import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Token, Project, ExportRecord } from './types';

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
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      teamId INTEGER NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      roleType INTEGER DEFAULT 0,
      visibility TEXT DEFAULT 'private',
      type TEXT DEFAULT 'HTTP',
      hasPublicDocsSite INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      projectName TEXT NOT NULL,
      exportType TEXT NOT NULL,
      oasVersion TEXT DEFAULT '3.1',
      exportFormat TEXT DEFAULT 'JSON',
      scope TEXT DEFAULT '{"type":"ALL"}',
      filePath TEXT,
      status TEXT DEFAULT 'pending',
      error TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      completedAt TEXT
    );
  `);
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export const tokenDb = {
  insert(token: Token): number {
    const stmt = getDb().prepare(
      'INSERT INTO tokens (name, token) VALUES (?, ?)'
    );
    const result = stmt.run(token.name, token.token);
    return result.lastInsertRowid as number;
  },

  findAll(): Token[] {
    const stmt = getDb().prepare('SELECT * FROM tokens ORDER BY id DESC');
    return stmt.all() as Token[];
  },

  findById(id: number): Token | undefined {
    const stmt = getDb().prepare('SELECT * FROM tokens WHERE id = ?');
    return stmt.get(id) as Token | undefined;
  },

  findByToken(token: string): Token | undefined {
    const stmt = getDb().prepare('SELECT * FROM tokens WHERE token = ?');
    return stmt.get(token) as Token | undefined;
  },

  update(id: number, token: Partial<Token>): void {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (token.name !== undefined) {
      fields.push('name = ?');
      values.push(token.name);
    }
    if (token.token !== undefined) {
      fields.push('token = ?');
      values.push(token.token);
    }
    
    if (fields.length > 0) {
      fields.push("updatedAt = datetime('now')");
      values.push(id);
      const stmt = getDb().prepare(
        `UPDATE tokens SET ${fields.join(', ')} WHERE id = ?`
      );
      stmt.run(...values);
    }
  },

  delete(id: number): void {
    const stmt = getDb().prepare('DELETE FROM tokens WHERE id = ?');
    stmt.run(id);
  },
};

export const projectDb = {
  insert(project: Project): number {
    const stmt = getDb().prepare(`
      INSERT INTO projects (projectId, name, teamId, description, icon, roleType, visibility, type, hasPublicDocsSite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      project.projectId,
      project.name,
      project.teamId,
      project.description,
      project.icon,
      project.roleType,
      project.visibility,
      project.type,
      project.hasPublicDocsSite ? 1 : 0
    );
    return result.lastInsertRowid as number;
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
    const stmt = getDb().prepare('SELECT * FROM projects WHERE projectId = ?');
    const row = stmt.get(projectId) as any;
    if (row) {
      return { ...row, hasPublicDocsSite: Boolean(row.hasPublicDocsSite) };
    }
    return undefined;
  },

  upsert(project: Project): number {
    const existing = projectDb.findByProjectId(project.projectId);
    if (existing) {
      const stmt = getDb().prepare(`
        UPDATE projects SET name = ?, teamId = ?, description = ?, icon = ?, 
        roleType = ?, visibility = ?, type = ?, hasPublicDocsSite = ?,
        updatedAt = datetime('now')
        WHERE projectId = ?
      `);
      stmt.run(
        project.name,
        project.teamId,
        project.description,
        project.icon,
        project.roleType,
        project.visibility,
        project.type,
        project.hasPublicDocsSite ? 1 : 0,
        project.projectId
      );
      return existing.id!;
    }
    return projectDb.insert(project);
  },

  delete(id: number): void {
    const stmt = getDb().prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);
  },
};

export const exportDb = {
  insert(record: Omit<ExportRecord, 'id' | 'createdAt' | 'completedAt'>): number {
    const stmt = getDb().prepare(`
      INSERT INTO exports (projectId, projectName, exportType, oasVersion, exportFormat, scope, filePath, status, error)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      record.projectId,
      record.projectName,
      record.exportType,
      record.oasVersion,
      record.exportFormat,
      record.scope,
      record.filePath || null,
      record.status,
      record.error || null
    );
    return result.lastInsertRowid as number;
  },

  findAll(): ExportRecord[] {
    const stmt = getDb().prepare('SELECT * FROM exports ORDER BY id DESC');
    return stmt.all() as ExportRecord[];
  },

  findById(id: number): ExportRecord | undefined {
    const stmt = getDb().prepare('SELECT * FROM exports WHERE id = ?');
    return stmt.get(id) as ExportRecord | undefined;
  },

  findByProjectId(projectId: number): ExportRecord[] {
    const stmt = getDb().prepare('SELECT * FROM exports WHERE projectId = ? ORDER BY id DESC');
    return stmt.all(projectId) as ExportRecord[];
  },

  updateStatus(id: number, status: ExportRecord['status'], error?: string): void {
    const stmt = getDb().prepare(`
      UPDATE exports SET status = ?, error = ?, completedAt = datetime('now')
      WHERE id = ?
    `);
    stmt.run(status, error || null, id);
  },

  updateFilePath(id: number, filePath: string): void {
    const stmt = getDb().prepare('UPDATE exports SET filePath = ? WHERE id = ?');
    stmt.run(filePath, id);
  },

  delete(id: number): void {
    const stmt = getDb().prepare('DELETE FROM exports WHERE id = ?');
    stmt.run(id);
  },
};
