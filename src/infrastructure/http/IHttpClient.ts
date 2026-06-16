export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

export interface IHttpClient {
  request<T>(endpoint: string, options?: HttpRequestOptions): Promise<T>
}
