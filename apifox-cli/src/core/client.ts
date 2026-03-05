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

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  async listProjects(): Promise<any> {
    return this.request('/api/v1/user-projects', 'GET');
  }

  async importOpenApi(projectId: string, input: object, options?: object): Promise<any> {
    const body = {
      input,
      options: options || {},
    };
    return this.request(`/v1/projects/${projectId}/import-openapi`, 'POST', body);
  }

  async importPostman(projectId: string, input: string, options?: object): Promise<any> {
    const body = {
      input,
      options: options || {},
    };
    return this.request(`/v1/projects/${projectId}/import-postman-collection`, 'POST', body);
  }

  async exportOpenApi(projectId: string, options: object): Promise<any> {
    return this.request(`/v1/projects/${projectId}/export-openapi`, 'POST', options);
  }
}
