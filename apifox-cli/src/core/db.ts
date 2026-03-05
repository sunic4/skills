import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Project, OpenApi } from './types';
import { Database as DatabaseType } from './types/db';

const DB_PATH = path.join(os.homedir(), '.apifox', 'apifox.db');

let db: Kysely<DatabaseType> | null = null;
let sqliteDb: Database.Database | null = null;

export function getDb(): Kysely<DatabaseType> {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const database = new Database(DB_PATH);
    sqliteDb = database;
    initTables(database);
    db = new Kysely<DatabaseType>({
      dialect: new SqliteDialect({ database }),
    });
  }
  return db;
}

function initTables(database: Database.Database): void {
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

    CREATE UNIQUE INDEX IF NOT EXISTS idx_openapis_project_url
    ON openapis(projectId, url);
  `);
}

export function closeDb(): void {
  if (db) {
    db.destroy();
    db = null;
  }
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
}

function rowToProject(row: any): Project {
  return {
    ...row,
    hasPublicDocsSite: Boolean(row.hasPublicDocsSite)
  };
}

export const projectDb = {
  insert(project: Project): Promise<number> {
    const db = getDb();
    return db.insertInto('projects')
      .values({
        id: project.id,
        name: project.name,
        teamId: project.teamId,
        description: project.description,
        roleType: project.roleType,
        visibility: project.visibility,
        type: project.type,
        hasPublicDocsSite: project.hasPublicDocsSite ? 1 : 0
      })
      .executeTakeFirst()
      .then(() => project.id);
  },

  findAll(): Promise<Project[]> {
    const db = getDb();
    const rows = db.selectFrom('projects')
      .selectAll()
      .orderBy('id', 'desc')
      .execute();
    return rows.then(list => list.map(rowToProject));
  },

  findByProjectId(projectId: number): Promise<Project | undefined> {
    const db = getDb();
    return db.selectFrom('projects')
      .selectAll()
      .where('id', '=', projectId)
      .executeTakeFirst()
      .then(row => row ? rowToProject(row) : undefined);
  },

  upsert(project: Project): Promise<number> {
    const db = getDb();
    return db.insertInto('projects')
      .values({
        id: project.id,
        name: project.name,
        teamId: project.teamId,
        description: project.description,
        roleType: project.roleType,
        visibility: project.visibility,
        type: project.type,
        hasPublicDocsSite: project.hasPublicDocsSite ? 1 : 0
      })
      .onConflict(oc => oc.column('id').doUpdateSet({
        name: project.name,
        teamId: project.teamId,
        description: project.description,
        roleType: project.roleType,
        visibility: project.visibility,
        type: project.type,
        hasPublicDocsSite: project.hasPublicDocsSite ? 1 : 0
      }))
      .executeTakeFirst()
      .then(() => project.id);
  },

  delete(projectId: number): Promise<void> {
    const db = getDb();
    return db.deleteFrom('projects')
      .where('id', '=', projectId)
      .execute()
      .then(() => undefined);
  },
};

export const openapiDb = {
  insert(openapi: OpenApi): Promise<number> {
    const db = getDb();
    return db.insertInto('openapis')
      .values({
        projectId: openapi.projectId,
        url: openapi.url,
        name: openapi.name,
        method: openapi.method,
        json: openapi.json,
        description: openapi.description || '',
        updatedAt: ''
      })
      .executeTakeFirst()
      .then(result => Number(result?.insertId ?? 0));
  },

  findAll(): Promise<OpenApi[]> {
    const db = getDb();
    return db.selectFrom('openapis')
      .selectAll()
      .orderBy('id', 'desc')
      .execute();
  },

  findByProjectId(projectId: number): Promise<OpenApi[]> {
    const db = getDb();
    return db.selectFrom('openapis')
      .selectAll()
      .where('projectId', '=', projectId)
      .orderBy('id', 'desc')
      .execute();
  },

  findByKeyword(keyword: string): Promise<OpenApi[]> {
    const db = getDb();
    const pattern = `%${keyword}%`;
    return db.selectFrom('openapis')
      .selectAll()
      .where((eb) => eb.or([
        eb('name', 'like', pattern),
        eb('url', 'like', pattern),
        eb('description', 'like', pattern),
      ]))
      .orderBy('id', 'desc')
      .execute();
  },

  upsert(openapi: OpenApi): Promise<number> {
    const db = getDb();
    return db.insertInto('openapis')
      .values({
        projectId: openapi.projectId,
        url: openapi.url,
        name: openapi.name,
        method: openapi.method,
        json: openapi.json,
        description: openapi.description || '',
        updatedAt: ''
      })
      .onConflict(oc => oc.columns(['projectId', 'url']).doUpdateSet({
        name: openapi.name,
        method: openapi.method,
        json: openapi.json,
        description: openapi.description,
        updatedAt: new Date().toISOString()
      }))
      .executeTakeFirst()
      .then(result => Number(result?.insertId ?? 0));
  },

  deleteByProjectId(projectId: number): Promise<void> {
    const db = getDb();
    return db.deleteFrom('openapis')
      .where('projectId', '=', projectId)
      .execute()
      .then(() => undefined);
  },
};
