/**
 * @module formulascript/engine (public) (legacy)
 * @description This module contains the formulascript engine
 * @author Twan Walpot <twan@stay-bold.com>
 *
 * IMPORTANT:
 * The engine is considered legacy and will be replaced in the future.
 * The future engine will be be more generic, simpler and faster. It will
 * not make assumptions based on business logic and will be more suitable
 * for use in other projects.
 *
 * The engine allows users to evaluate multiple formulas which can reference
 * each other. The engine will keep track of the dependencies between the
 * formulas and will only evaluate the formulas that have changed (at least this is the goal).
 */

import { compile } from './compiler';
import {
  type Code,
  interpret,
  type Namespace,
  type Result,
} from './interpreter';

const isNil = (value: any): boolean => {
  return value === undefined || value === null;
};

type _Context = { value: Value; type: 'context' };
type _Formula = { value: string; type: 'formula' };
type _Internal = { value: any; type: 'internal' };
type Value = _Context | _Formula | _Internal;

type EnvironmentContext = { [ref: string]: Value };
type Results = { [ref: string]: Result };

class Environment {
  ctx: {
    globals: Record<string, any>;
    internal: Record<string, any>;
  } = {
    internal: {},
    globals: {},
  };

  deps: { [ref: string]: string[] } = {};

  state: { [ref: string]: Result } = {};

  formulas: { [ref: string]: Code } = {};

  initialized = false;

  currentChanges: Set<string> = new Set();

  compileCache: Map<string, Code>;

  constructor(private builtins: Record<string, any>) {
    this.builtins = builtins;
    this.compileCache = new Map();
  }

  async results() {
    if (this.initialized) {
      return this.state;
    }

    const refs = Object.keys(this.formulas);
    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i];

      // eslint-disable-next-line no-await-in-loop
      this.state[ref] = await this.evaluateFormula(ref);
    }
    this.initialized = true;
    return this.state;
  }

  public async set(ref: string, value: Value) {
    const changed =
      value.type === 'formula'
        ? this.setFormula(ref, value.value)
        : this.setValue(ref, value);
    if (changed && this.initialized) {
      await this.update(ref);
    }
  }

  private setValue(ref: string, _value: Value): boolean {
    const { value, type } = _value;

    // if (ve !== undefined) {
    //   this.setFormula(`${ref}-VE`, ve);
    // }

    if (type === 'internal') {
      this.ctx.internal[ref] = value;
      return false;
    }

    if (this.ctx.globals[ref] === value) {
      return false;
    }

    this.ctx.globals[ref] = value;
    return true;
  }

  private compile(source: string): Code {
    const cached = this.compileCache.get(source);

    if (cached) {
      return cached;
    }

    const code = compile(source);
    this.compileCache.set(source, code);

    return code;
  }

  private setFormula(ref: string, formula: string): boolean {
    if (this.formulas[ref]?.source === formula) {
      return false;
    }

    const oldFormula = this.formulas[ref];
    // remove old dependency relations
    if (oldFormula !== undefined) {
      const { names } = oldFormula;
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const deps = this.deps[name] || [];
        delete deps[deps.indexOf(ref)];
      }
    }

    const newFormula = this.compile(formula);
    this.formulas[ref] = newFormula;

    // set new dependency relations
    const { names } = newFormula;
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const deps = this.deps[name] || [];
      deps.push(ref);
      this.deps[name] = deps;
    }

    return true;
  }

  getChanges(trigger: string): Set<string> {
    const changes = new Set([trigger]);
    const queue = [trigger];

    while (queue.length > 0) {
      const ref = queue.pop();
      const deps = this.deps[ref!] || [];
      for (let i = 0; i < deps.length; i++) {
        const change = deps[i];
        if (!changes.has(change)) {
          changes.add(change);
          queue.push(change);
        }
      }
    }

    return changes;
  }

  async update(trigger: string) {
    const changes = this.getChanges(trigger);
    this.currentChanges = changes;

    const values = Array.from(changes);

    for (let i = 0; i < values.length; i++) {
      const ref = values[i];
      // eslint-disable-next-line no-await-in-loop
      this.state[ref] = await this.evaluateFormula(ref);
    }
  }

  async evaluateFormula(ref: string, path: string[] = [ref]): Promise<Result> {
    const formula = this.formulas[ref];

    if (isNil(formula)) {
      return { result: null, error: null };
    }

    const depCtx: {
      builtins: Record<string, any>;
      globals: Record<string, any>;
    } = {
      builtins: this.builtins,
      globals: {},
    };

    Object.entries(this.ctx.internal).forEach(([key, value]) => {
      depCtx.globals[key] = value;
    });

    for (let i = 0; i < formula.names.length; i++) {
      const dep = formula.names[i];

      if (path.includes(dep)) {
        return {
          result: null,
          error: new Error('#REF! circular reference detected'),
        };
      }

      const variable = this.ctx.globals[dep];

      // dependency is simple value present in ctx
      if (variable !== undefined) {
        const vRef = `${dep}-VE`;
        if (this.formulas[vRef]) {
          // eslint-disable-next-line no-await-in-loop
          const ve = await this.evaluateFormula(vRef, path.concat(ref, dep));
          if (ve.error) {
            return {
              result: null,
              error: new Error(`#REF! Error in visbility equation of '${dep}'`),
            };
          }
          if (ve.result) {
            depCtx.globals[dep] = variable;
          } else {
            depCtx.globals[dep] = 0;
          }
        } else {
          depCtx.globals[dep] = variable;
        }
        // continue;
      }
      // dependency is a formula
      else if (this.formulas[dep] !== undefined) {
        let result: Result;

        // means it hasnt been evaluated yet after a change
        // we do not know the order of changes so we need to
        // always ensure that the formula is evaluated before
        if (this.currentChanges.has(dep)) {
          // eslint-disable-next-line no-await-in-loop
          result = await this.evaluateFormula(dep, path.concat(ref));
          this.currentChanges.delete(dep);
        } else {
          result =
            this.state[dep] ??
            // eslint-disable-next-line no-await-in-loop
            (await this.evaluateFormula(dep, path.concat(ref)));
        }

        this.state[dep] = result;

        depCtx.globals[dep] =
          result.error === null
            ? result.result
            : (new Error(`#REF! Error in referenced formula: ${dep}`) as any);
      }
    }

    const rv = await interpret(formula, depCtx.globals, depCtx.builtins);
    this.state[ref] = rv;
    return rv;
  }
}

const evaluateWithEnv = async (
  env: Environment,
  ctx: EnvironmentContext,
): Promise<Results> => {
  const ctxArray = Object.entries(ctx);

  for (let i = 0; i < ctxArray.length; i++) {
    const [ref, value] = ctxArray[i];
    // eslint-disable-next-line no-await-in-loop
    await env.set(ref, value);
  }

  const results = await env.results();
  return results;
};

export const evaluate = async (
  ctx: EnvironmentContext,
  builtins: Namespace,
): Promise<Results> => {
  const env = new Environment(builtins);
  return evaluateWithEnv(env, ctx);
};
