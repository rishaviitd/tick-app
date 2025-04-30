/**
 * API utilities for consistent authentication and request handling
 */

// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Creates headers with authentication tokens for API requests
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    "x-auth-token": token || "",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/**
 * Makes an authenticated API request
 * @param endpoint The API endpoint (without base URL)
 * @param options Request options
 * @returns Response data
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  try {
    const url = `${API_BASE_URL}${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;

    // Merge default headers with any provided headers
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    };

    console.log(`API Request to ${url} with headers:`, headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Log request details
    console.log(`API ${options.method || "GET"} ${endpoint}:`, {
      status: response.status,
    });

    // Handle non-OK responses
    if (!response.ok) {
      // Try to parse error response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: "Unknown error occurred" };
      }

      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    // Parse the response
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * API utility object with methods for common HTTP verbs
 */
export const api = {
  get: async <T>(endpoint: string, options: RequestInit = {}): Promise<T> =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: async <T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: async <T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: async <T>(endpoint: string, options: RequestInit = {}): Promise<T> =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

export default api;
