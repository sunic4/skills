import {
  ApiResponse,
  ProjectListItem,
  ExportOpenApiRequest,
  ExportOpenApiResponse
} from './types';

const API_BASE_URL = 'https://api.apifox.com';
const API_VERSION = '2024-03-28';
const CLIENT_VERSION = '2.8.13-alpha.1';

export interface ApifoxClientOptions {
  token: string;
}

export class ApifoxClient {
  private token: string;

  constructor(options: ApifoxClientOptions) {
    this.token = options.token;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Apifox-Api-Version': API_VERSION,
      'x-client-version': CLIENT_VERSION,
      'Authorization': `Bearer ${this.token}`,
    };
  }

  private async request<T>(endpoint: string, method: string, body?: object): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorObj = JSON.parse(text);
        if (errorObj.errorMessage) {
          errorMessage = errorObj.errorMessage;
        }
      } catch { }
      throw new Error(errorMessage);
    }

    if (!text) {
      return { data: [] } as T;
    }

    return JSON.parse(text) as T;
  }

  async getProjectList(): Promise<ApiResponse<ProjectListItem[]>> {
    return this.request<ApiResponse<ProjectListItem[]>>('/api/v1/user-projects', 'GET');
  }

  async getOpenApiBy(id: number): Promise<ExportOpenApiResponse> {
    const request: ExportOpenApiRequest = {
      scope: { type: 'ALL' },

      exportFormat: 'JSON',
    };
    return this.request<ExportOpenApiResponse>(
      `/v1/projects/${id}/export-openapi`,
      'POST',
      request
    );
  }
}
