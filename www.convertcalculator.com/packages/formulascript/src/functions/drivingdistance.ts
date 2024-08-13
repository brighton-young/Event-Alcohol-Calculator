import convert from 'convert';

import { Context, Deferred } from 'formulascript/interpreter';

import { fetchData, getArgsOrNA } from '../utils';

const DRIVINGDISTANCE = async (ctx: Context, args: Deferred[]) => {
  const [_lat1, _lng1, _lat2, _lng2, _unit] = getArgsOrNA(args, 4);

  const { featureFlags } = ctx.globals;
  const { placesViaGeoapify } = featureFlags;

  const lat1 = await _lat1(ctx);
  const lng1 = await _lng1(ctx);
  const lat2 = await _lat2(ctx);
  const lng2 = await _lng2(ctx);
  const unit = _unit ? await _unit(ctx) : 'm';

  if (!lat1 || !lng1 || !lat2 || !lng2) return 0;

  const result = await fetchData({
    url: '/api/embed/get-places-distance/',
    data: {
      destinations: [
        {
          type: 'coordinates',
          value: {
            lat: lat2,
            lng: lng2,
          },
        },
      ],
      origins: [
        {
          type: 'coordinates',
          value: {
            lat: lat1,
            lng: lng1,
          },
        },
      ],
      isProduction: true,
      useGeoapify: placesViaGeoapify, // FF: placesViaGeoapify: Remove this param when remove flag
    },
  });

  const distance = result.rows?.[0]?.elements?.[0]?.distance;

  return convert(distance.value, 'm').to(unit as any) as unknown as number;
};

export default DRIVINGDISTANCE;
