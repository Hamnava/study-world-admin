import { auth } from '@/auth';
import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

const isServer = typeof window === 'undefined';

const createAxiosInstance = (baseURL: string | undefined) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Add a request interceptor
   */
  instance.interceptors.request.use(async request => {
    try {
      let accessToken = null;

      if (isServer) {
        // Server-side: use auth
        const serverSession = await auth();
        accessToken = serverSession?.user?.accessToken;
      } else {
        const session = await getSession();
        accessToken = session?.user?.accessToken;
      }

      // Handle missing accessToken
      if (!accessToken) {
        const session = await auth(); // Fallback to your custom auth function
        accessToken = session?.user?.accessToken;

        if (!accessToken) {
          throw new UnauthorizedError('Unauthorized access');
        }
      }

      // Attach Authorization header if accessToken is available
      if (accessToken && request.headers) {
        request.headers.Authorization = `Bearer ${accessToken}`;
      }

      return request; // Always return the request object
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return request;
    }
  });

  /**
   * Add a response interceptor
   */
  instance.interceptors.response.use(
    response => {
      return response; // Simply return the successful response
    },
    async error => {
      if (error.response) {
        const { status, data } = error.response;

        if (
          status === 401 ||
          status === 403 ||
          data?.message === 'Not Authorized'
        ) {
          const session = await getSession();
          const accessToken = session?.user?.accessToken;
          if (!accessToken) {
            await signOut(); // Log out the user if token is missing or expired
          }
        }
      }

      // Return the error to the caller for further handling
      return Promise.reject(error);
    },
  );

  return instance;
};

const axiosV1 = createAxiosInstance(BACKEND_URL);

export { axiosV1 };
