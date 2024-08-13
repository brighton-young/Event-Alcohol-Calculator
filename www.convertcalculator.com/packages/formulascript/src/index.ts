import { evaluate as evaluateWithoutBuiltins } from 'formulascript/engine';

import builtins from './builtins';

type _Context = { value: Value; type: 'context' };
type _Formula = { value: string; type: 'formula' };
type _Internal = { value: any; type: 'internal' };
type Value = _Context | _Formula | _Internal;

type EnvironmentContext = { [ref: string]: Value };

export const evaluate = async (env: EnvironmentContext) => {
  return evaluateWithoutBuiltins(env, builtins);
};

export { builtins };
