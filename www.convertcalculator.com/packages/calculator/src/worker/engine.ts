import { evaluate } from '@cc/formulascript';
import fetchJson from '@cc/shared/utils/fetchJson';
import getWebsiteUrl from '@cc/shared/utils/getWebsiteUrl';
import { type Result } from 'formulascript/interpreter';

const loadDataSources = async (sources, loaders) => {
  return Promise.all(
    sources.map(async (source) => {
      const loader = loaders[source.type];

      if (!loader) {
        throw new Error(
          `Unknown data source type '${source.type}' for '${source.name}'`,
        );
      }

      return [source.reference, await loader(source)];
    }),
  );
};

const fetchTable = async (
  calculatorId: string,
  reference: string,
): Promise<any> => {
  const result = await fetchJson({
    url: getWebsiteUrl({ slug: '/api/embed/get-table/' }),
    method: 'GET',
    params: {
      calculatorId,
      reference,
    },
  });

  return result;
};

type Engine = {
  calculate: Calculate;
};

type Calculate = (payload: {
  calculatorId: string;
  context: Record<
    string,
    | { type: 'formula'; value: string }
    | { type: 'context'; value: any }
    | { type: 'internal'; value: any }
  >;
  sources: any[];
  calculatorDataSources: boolean;
  isProduction: boolean;
}) => Promise<Record<string, Result>>;

const createEngine = (): Engine => {
  let loadedDataSources: any;

  const calculate: Calculate = async (payload) => {
    const {
      calculatorId,
      context = {},
      sources = [],
      calculatorDataSources,
      isProduction,
    } = payload;

    // FF calculatorDataSources: remove conditional logic
    if (calculatorDataSources) {
      if (loadedDataSources === undefined) {
        loadedDataSources = await loadDataSources(sources, {
          table: async (source) => {
            return fetchTable(calculatorId, source.tableReference);
          },
        });
      }

      loadedDataSources.forEach(([reference, value]) => {
        context[reference] = { value, type: 'context' };
      });
    }

    // eslint-disable-next-line no-underscore-dangle
    context.__production__ = { value: isProduction, type: 'internal' };

    const results = await evaluate(context);

    return results;
  };

  return { calculate };
};

export default createEngine;
