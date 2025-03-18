import { auth } from '@/auth'
import { getSession } from 'next-auth/react'

import { BACKEND_URL, type ApiResponse } from './fetcher'

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

interface SearchParamOptions {
  tab: string
  sort: string
  search: string
}

const isServer = typeof window === 'undefined'

class AuthFetcher {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async getAccessToken(): Promise<string> {
    let accessToken = null

    if (isServer) {
      // Server-side: use auth
      const serverSession = await auth()
      accessToken = serverSession?.user?.accessToken
    } else {
      // Client-side: use getSession
      const session = await getSession()
      accessToken = session?.user?.accessToken
    }

    // Fallback check
    if (!accessToken) {
      const session = await auth()
      accessToken = session?.user?.accessToken
      if (!accessToken) {
        throw new UnauthorizedError('Unauthorized access')
      }
    }

    return accessToken
  }

  async get<T>(
    url: string,
    params?: Record<string, string | number>
  ): Promise<ApiResponse<T>> {
    const token = await this.getAccessToken()
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : ''
    const headers = new Headers({
      'Content-Type': 'application/json',
    })
    headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${this.baseUrl}${url}${queryString}`, {
      method: 'GET',
      headers,
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
    const token = await this.getAccessToken()
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options?.headers,
    })
    headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
      headers,
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
    const token = await this.getAccessToken()
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options?.headers,
    })
    headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
      headers,
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
    const token = await this.getAccessToken()
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options?.headers,
    })
    headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
      headers,
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
    const token = await this.getAccessToken()
    const headers = new Headers({
      'Content-Type': 'application/json',
    })
    headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
      headers,
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

const authFetcher = new AuthFetcher(BACKEND_URL || '')

export { authFetcher }

