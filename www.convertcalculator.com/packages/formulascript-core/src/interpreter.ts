/**
 * @module formulascript/interpreter (public)
 * @description This module contains the formulascript interpreter
 * @author Twan Walpot <twan@stay-bold.com>
 *
 * NOTE:
 * The interpreter is just a wrapper around the compiler and the deferreds. In the
 * future we might want to migrate to a bytecode interpreter, this module is used
 * to abstract away the compiler and deferreds so that we can easily migrate to
 * a bytecode interpreter in the future.
 *
 * The interpreter is responsible for creating and managing the context which is
 * then used to evaluate the deferreds. The context is response for storing and
 * loading variables and for tracking scopes (this is not properly implemented yet)
 * as well as for collecting warnings (not actively used yet). In the future the
 * context will be responsible for wrapping values and errors to include important
 * information such as the source code and the location of the error.
 */

// TODO:
// - [ ] fix scoping issues in lambdas
// - [ ] add `Context.error` method to wrap errors with source code and location

export type Value =
  | null
  | number
  | boolean
  | string
  | Value[]
  | Error
  | { [name: string]: Value }
  | ((ctx: Context, args: Deferred[]) => Promise<Value>);

export type Deferred = (ctx: Context) => Promise<Value>;

export type Namespace = Record<string, Value>;

export type Expression = {
  deferred: Deferred;
  names: string[];
  startOffset: number;
  endOffset: number;
};

type Frame = {
  locals: Map<string, Value>;
};

export type ContextOptions = {
  builtins?: Namespace;
  globals?: Namespace;
};

export class Context {
  public builtins: Namespace;

  public readonly globals: Namespace;

  private frame: Frame;

  public warnings: string[];

  constructor(public source: string, options: ContextOptions = {}) {
    this.source = source;
    this.builtins = options.builtins ?? {};
    this.globals = options.globals ?? {};

    this.frame = { locals: new Map() };
    this.warnings = [];
  }

  /**
   * @param name string name of the variable to be loaded from the context
   *
   * @returns Value or undefined if the variable is not found
   *
   * @description
   * This method is used to load a variable from the context.
   * It first tries to load the variable from the builtin namespace,
   * then from the global namespace and finally from the local namespace.
   * If the variable is not found in any of the namespaces, it returns undefined.
   * The order of the namespaces is not important because it is not possible
   * to have the same variable name in more than one namespace.
   */
  load(name: string): Value | undefined {
    // NOTE: we don't use the `??` operator here because we want to allow
    // `null` values to be stored in the context.
    const localRef = this.frame.locals.get(name);

    if (localRef !== undefined) return localRef;

    const globalRef = this.globals[name];

    if (globalRef !== undefined) return globalRef;

    const builtin = this.builtins[name.toUpperCase()];

    if (builtin !== undefined) return builtin;

    return undefined;
  }

  /**
   * @param name string name of the variable to be stored in the context
   * @param value Value value to be stored in the context
   * @param scope 'global' | 'local' scope of the variable
   *
   * @returns boolean true if the variable was stored successfully
   *
   * @description
   * This method is used to store a variable in the context.
   */
  store(name: string, value: Value): boolean {
    if (value === undefined) return false;

    if (this.frame.locals.has(name)) return false;

    this.frame.locals.set(name, value);

    return true;
  }

  /**
   * @param message string warning to be collected
   *
   * @description
   * This method is used to collect warnings in a formula.
   * Warnings are not fatal and do not stop the evaluation of a formula,
   * but are useful to inform the user about potential problems.
   */
  warn(message: string): void {
    this.warnings.push(message);
  }

  /**
   * @param frame Frame frame to be captured
   *
   * @description
   * This method is used to capture an external frame into the current frame.
   * It can be seen as a merge of the current frame with the captured frame.
   */
  capture(frame: Frame): void {
    this.frame = {
      locals: new Map([...this.frame.locals, ...frame.locals]),
    };
  }

  /**
   * @param frame Frame frame to be restored
   *
   * @description
   * This method is used to restore a frame.
   * Basically: setting the frame.
   */
  restore(frame: Frame): void {
    this.frame = frame;
  }

  /**
   * @returns Frame a copy of the current frame
   *
   * @description
   * This method is used to clone the current frame.
   * Builtins are never cloned as you cannot change them.
   */
  cloneFrame(): Frame {
    return {
      locals: new Map([...this.frame.locals]),
    };
  }

  /**
   * @param formula formula to be evaluated
   *
   * @returns Value result of the evaluation
   *
   * @throws Error if the evaluation fails
   */
  async evaluate(expression: Expression): Promise<Value> {
    return expression.deferred(this);
  }
}

export type Result = {
  result: Value | null;
  error: Error | null;
};

export type Code = {
  expr: Expression;
  names: string[];
  source: string;
};

export const interpret = async (
  code: Code,
  vars: Namespace,
  // TODO: we want to move to just a single namespace `vars`
  builtins: Namespace,
): Promise<Result> => {
  const ctx = new Context(code.source, { builtins, globals: vars });

  try {
    const result = await ctx.evaluate(code.expr);
    if (result === undefined) {
      throw new Error(
        'The result of the formula is empty, this means you probably made a mistake in your formula',
      );
    }
    return { result, error: null };
  } catch (error) {
    return { result: null, error: error as Error };
  }
};
