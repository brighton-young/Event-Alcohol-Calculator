import convert from 'convert';
import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const DISTANCE = async (ctx: Context, args: Deferred[]) => {
  const [_lat1, _lng1, _lat2, _lng2, _unit] = getArgsOrNA(args, 4);

  let lat1 = await _lat1(ctx);
  const lng1 = await _lng1(ctx);
  let lat2 = await _lat2(ctx);
  const lng2 = await _lng2(ctx);
  const unit = _unit ? await _unit(ctx) : 'm';

  const toRadian = (angle) => {
    return (Math.PI / 180) * angle;
  };
  const distance = (a, b) => {
    return (Math.PI / 180) * (a - b);
  };
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(lat2, lat1);
  const dLon = distance(lng2, lng1);

  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);

  // Haversine Formula
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));

  const finalDistance = RADIUS_OF_EARTH_IN_KM * c;

  return convert(finalDistance * 1000, 'm').to(
    unit as any,
  ) as unknown as number;
};

export default DISTANCE;
