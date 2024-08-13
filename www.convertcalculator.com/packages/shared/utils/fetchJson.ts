import { isNil } from 'lodash';

export type FetchJsonProps<D = Record<string, any>> = {
  url: string | URL;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  data?: D;
  headers?: Record<string, any>;
  params?: Record<string, any>;
  keepalive?: boolean;
};

type ErrorResult = {
  message: string;
  status: 'error';
};

const fetchJson = async <T, D = Record<string, any>>({
  url,
  method = 'GET',
  data,
  headers = {},
  params = {},
  keepalive = false,
}: FetchJsonProps<D>) => {
  const urlWithParams = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    if (isNil(value)) return;

    urlWithParams.searchParams.append(key, value);
  });

  if (method === 'GET' || method === 'DELETE') {
    Object.entries(data || {}).forEach(([key, value]) => {
      if (isNil(value) || typeof value !== 'string') return;

      urlWithParams.searchParams.append(key, value);
    });
  }

  const result = await fetch(urlWithParams.href, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    ...((method === 'POST' || method === 'PUT' || method === 'PATCH') && {
      body: JSON.stringify(data),
      keepalive,
    }),
  });

  const resultData = (await result.json()) as T | ErrorResult;

  if (!result.ok) {
    if (
      !!resultData &&
      typeof resultData === 'object' &&
      'message' in resultData &&
      'status' in resultData &&
      resultData.status === 'error'
    ) {
      throw new Error(`${result.status}: ${resultData.message}`);
    } else {
      throw new Error(`${result.status}: Unknown error occurred`);
    }
  }

  return resultData as T;
};

export default fetchJson;
