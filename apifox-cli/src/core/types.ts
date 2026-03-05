export interface Project {
  id: number;
  name: string;
  teamId: number;
  description: string;
  roleType: number;
  visibility: string;
  type: string;
  hasPublicDocsSite: boolean;
}

export interface OpenApi {
  id?: number;
  projectId: number;
  url: string;
  name: string;
  method: string;
  json: string;
  description?: string;
}

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface ProjectListItem {
  id: number;
  name: string;
  teamId: number;
  description: string;
  roleType: number;
  visibility: string;
  type: string;
  hasPublicDocsSite: boolean;
}

export interface ExportOpenApiRequest {
  scope: {
    type: 'ALL' | 'SELECTED_ENDPOINTS' | 'SELECTED_TAGS' | 'SELECTED_FOLDERS';
    selectedEndpointIds?: number[];
    selectedTags?: string[];
    selectedFolderIds?: number[];
    excludedByTags?: string[];
  };
  options?: {
    includeApifoxExtensionProperties?: boolean;
    addFoldersToTags?: boolean;
  };
  oasVersion?: '3.0' | '3.1' | '2.0';
  exportFormat: 'JSON' | 'YAML';
  environmentIds?: number[];
  branchId?: number;
  moduleId?: number;
}

export interface ExportOpenApiResponse {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  tags?: Array<{ name: string }>;
  paths: Record<string, Record<string, any>>;
  components?: Record<string, any>;
  servers?: Array<{ url: string }>;
}
