import { Generated, Kysely } from 'kysely';

export interface ProjectRow {
  id: number;
  name: string;
  teamId: number;
  description: string;
  roleType: number;
  visibility: string;
  type: string;
  hasPublicDocsSite: number;
}

export interface OpenApiRow {
  id: Generated<number>;
  projectId: number;
  url: string;
  name: string;
  method: string;
  json: string;
  description: string;
  updatedAt: string;
}

export interface Database {
  projects: ProjectRow;
  openapis: OpenApiRow;
}

export type DatabaseClient = Kysely<Database>;
