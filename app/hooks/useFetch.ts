import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useState, useCallback, useEffect } from 'react';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface UseFetchOptions<T> {
  initialData?: T;
  immediate?: boolean;
  config?: AxiosRequestConfig;
}

export function useFetch<T = any>(
  endpoint: string,
  method: HttpMethod = 'get',
  options: UseFetchOptions<T> = {}
) {
  const { initialData = null, immediate = false, config = {} } = options;
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const execute = useCallback(
    async (body?: any, params?: any) => {
      setLoading(true);
      setError(null);

      try {
        const fullConfig: AxiosRequestConfig = {
          ...config,
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            ...config.headers,
          },
        };

        const response = await axios.request<T>({
          url: `${process.env.NEST_API_URL}${endpoint}`,
          method,
          data: body,
          ...fullConfig,
        });

        setData(response.data);
        return response.data;
      } catch (err) {
        setError(err as AxiosError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, config]
  );

  // Exécution automatique si immediate=true
  useEffect(() => {
    if (immediate && method === 'get') {
      execute();
    }
  }, [execute, immediate, method]);

  return { data, loading, error, execute, setData };
}