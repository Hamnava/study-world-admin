interface ApiError {
  message: string
  reason?: string
  statusCode: number
  body?: string
}

interface ApiResponseMetadata {
  count: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  statusCode: number
  data?: T
  errors?: ApiError[]
  metaData?: ApiResponseMetadata
}

interface SearchParamOptions {
  tab: string
  sort: string
  search: string
}

class Fetcher {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(
    url: string,
    params?: Record<string, string | number>
  ): Promise<ApiResponse<T>> {
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : ''
    const response = await fetch(`${this.baseUrl}${url}${queryString}`, {
      method: 'GET',
    })
    let json: ApiResponse<T>
    try {
      json = await response.json()
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      }
    }
    return json
  }

  async post<T, D>(
    url: string,
    data: D,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    })
    let json: ApiResponse<T>
    try {
      json = await response.json()
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      }
    }
    return json
  }

  async put<T, D>(
    url: string,
    data: D,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    })
    let json: ApiResponse<T>
    try {
      json = await response.json()
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      }
    }
    return json
  }

  async patch<T, D>(
    url: string,
    data: D,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    })
    let json: ApiResponse<T>
    try {
      json = await response.json()
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      }
    }
    return json
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
    })
    let json: ApiResponse<T>
    try {
      json = await response.json()
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      }
    }
    return json
  }

  static formatSearchParams(params: Partial<SearchParamOptions>): string {
    return Object.entries(params)
      .filter(([, value]) => Boolean(value))
      .map(([k, v]) =>
        ['sort', 'search', 'filter', 'page'].includes(k)
          ? `${k}.slug:${v}`
          : `${k}:${v}`
      )
      .join(';')
  }
}
export const BACKEND_URL = process.env.API_BASE_URL
const fetcher = new Fetcher(BACKEND_URL || '')

export { fetcher }
