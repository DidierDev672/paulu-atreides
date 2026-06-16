import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { HttpError } from './HttpError'
import type { HttpRequestOptions, IHttpClient } from './IHttpClient'

export class AxiosHttpClient implements IHttpClient {
  private readonly client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  async request<T>(endpoint: string, options: HttpRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options

    try {
      const response = await this.client.request<T>({
        url: endpoint,
        method,
        data: body,
        headers,
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const payload = error.response?.data
        const message =
          (payload &&
            typeof payload === 'object' &&
            'message' in payload &&
            typeof payload.message === 'string' &&
            payload.message) ||
          'Ocurrió un error al procesar la solicitud.'

        throw new HttpError(message, error.response?.status ?? 500)
      }

      throw error
    }
  }
}
