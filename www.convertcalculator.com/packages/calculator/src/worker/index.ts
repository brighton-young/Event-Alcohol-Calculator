import mapObject from '@cc/shared/utils/mapObject';

import engine from './engine';
import { MessageName, Payload, WorkerInterface } from './interface';

const sanitize = (obj: any) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'function') {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  if (obj instanceof Error) {
    return {
      message: obj.message,
    };
  }

  if (typeof obj === 'object') {
    if (Object.keys(obj).length === 0) {
      return obj;
    }

    return mapObject(obj, sanitize);
  }

  return obj;
};

export const setup = () => {
  const app: WorkerInterface = {
    ...engine(),
  };

  return async (
    ev: MessageEvent<{
      name: MessageName;
      payload: Payload;
      messageId?: string;
    }>,
  ) => {
    const { name, payload, messageId } = ev.data;

    const method = app[name];

    if (!method) {
      // TODO: error handling
      return;
    }

    const result = await method(payload);

    postMessage({ name, result: sanitize(result), messageId });
  };
};
