import { auth } from '@/auth';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
interface ApiError {
  message: string;
  reason?: string;
  statusCode: number;
  body?: string;
}

interface ApiResponseMetadata {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
  errors?: ApiError[];
  metaData?: ApiResponseMetadata;
}

interface SearchParamOptions {
  tab: string;
  sort: string;
  search: string;
}

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

interface SearchParamOptions {
  tab: string;
  sort: string;
  search: string;
}

const isServer = typeof window === 'undefined';

class AuthFetcher {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async getAccessToken(): Promise<string> {
    let accessToken = null;

    if (isServer) {
      // Server-side: use auth
      const serverSession = await auth();
      accessToken = serverSession?.user?.accessToken;
    } else {
      // Client-side: use getSession
      const session = await getSession();
      accessToken = session?.user?.accessToken;
    }

    // Fallback check
    if (!accessToken) {
      const session = await auth();
      accessToken = session?.user?.accessToken;
      if (!accessToken) {
        throw new UnauthorizedError('Unauthorized access');
      }
    }

    return accessToken;
  }

  async get<T>(
    url: string,
    params?: Record<string, string | number>,
  ): Promise<ApiResponse<T>> {
    const token = await this.getAccessToken();
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : '';
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${this.baseUrl}${url}${queryString}`, {
      method: 'GET',
      headers,
    });
    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      };
    }
    return json;
  }

  async post<T, D>(
    url: string,
    data: D,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const token = await this.getAccessToken();
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options?.headers,
    });
    headers.set('Authorization', `Bearer ${token}`);

    // Check if the data is FormData
    if (data instanceof FormData) {
      // Don't set Content-Type for FormData, let the browser set it
      headers.delete("Content-Type")
    } else {
      headers.set("Content-Type", "application/json")
    }
    
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
      headers,
    });
    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      };
    }
    return json;
  }

  async put<T, D>(
    url: string,
    data: D,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const token = await this.getAccessToken();
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options?.headers,
    });
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
      headers,
    });
    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      };
    }
    return json;
  }

  async patch<T, D>(
    url: string,
    data: D,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const token = await this.getAccessToken();
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options?.headers,
    });
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
      headers,
    });
    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      };
    }
    return json;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const token = await this.getAccessToken();
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
      headers,
    });
    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch (e: any) {
      json = {
        success: false,
        message: e.message,
        statusCode: response.status,
      };
    }
    return json;
  }

  static formatSearchParams(params: Partial<SearchParamOptions>): string {
    return Object.entries(params)
      .filter(([, value]) => Boolean(value))
      .map(([k, v]) =>
        ['sort', 'search', 'filter', 'page'].includes(k)
          ? `${k}.slug:${v}`
          : `${k}:${v}`,
      )
      .join(';');
  }
}

const authFetcher = new AuthFetcher(API_BASE_URL || '');

export { authFetcher };

