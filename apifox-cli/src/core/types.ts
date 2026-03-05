export interface Token {
  id?: number;
  name: string;
  token: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id?: number;
  projectId: number;
  name: string;
  teamId: number;
  description: string;
  icon: string;
  roleType: number;
  visibility: string;
  type: string;
  hasPublicDocsSite: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExportRecord {
  id?: number;
  projectId: number;
  projectName: string;
  exportType: string;
  oasVersion: string;
  exportFormat: string;
  scope: string;
  filePath?: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  createdAt?: string;
  completedAt?: string;
}
