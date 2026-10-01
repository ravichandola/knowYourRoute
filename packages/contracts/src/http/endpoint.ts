import type { ZodType, ZodTypeDef } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ExtractParamNames<P extends string> = P extends `${string}:${infer Name}/${infer Rest}`
  ? Name | ExtractParamNames<`/${Rest}`>
  : P extends `${string}:${infer Name}`
    ? Name
    : never;

/** `'/:id/snapshot'` -> `{ id: string }`; paths without params -> `undefined`. */
export type PathParams<P extends string> = [ExtractParamNames<P>] extends [never]
  ? undefined
  : { [K in ExtractParamNames<P>]: string };

type Schema<T> = ZodType<T, ZodTypeDef, unknown>;

/**
 * One HTTP operation of the API. The same object is used by the server (route path + request
 * validation) and by clients (typed call), so both sides cannot drift apart.
 *
 * `_response` is a phantom field that only carries the response type.
 */
export interface Endpoint<TResponse, TBody, TQuery, TPath extends string> {
  readonly method: HttpMethod;
  readonly basePath: string;
  readonly path: TPath;
  readonly fullPath: string;
  readonly bodySchema?: Schema<TBody>;
  readonly querySchema?: Schema<TQuery>;
  readonly _response?: TResponse;
}

export type AnyEndpoint = Endpoint<unknown, unknown, unknown, string>;

export interface EndpointOptions<TBody, TQuery> {
  body?: Schema<TBody>;
  query?: Schema<TQuery>;
}

/**
 * Creates endpoint builders scoped to a controller base path.
 *
 * `e.get<Response, Query>()('/:id', { body, query })` - the response/query types are given
 * explicitly, the path params and body types are inferred.
 */
export function createEndpointFactory(basePath: string) {
  const make =
    (method: HttpMethod) =>
    <TResponse, TQuery = undefined>() =>
    <const TPath extends string, TBody = undefined>(
      path: TPath,
      options: EndpointOptions<TBody, TQuery> = {}
    ): Endpoint<TResponse, TBody, TQuery, TPath> => ({
      method,
      basePath,
      path,
      fullPath: `/${basePath}${path}`,
      bodySchema: options.body,
      querySchema: options.query,
    });

  return {
    get: make('GET'),
    post: make('POST'),
    put: make('PUT'),
    patch: make('PATCH'),
    delete: make('DELETE'),
  };
}

export function buildPath(
  fullPath: string,
  params?: Record<string, string>,
  query?: Record<string, unknown>
): string {
  const resolved = fullPath.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => {
    const value = params?.[name];
    if (value === undefined) {
      throw new Error(`Missing path param "${name}" for ${fullPath}`);
    }
    return encodeURIComponent(value);
  });

  if (!query) {
    return resolved;
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `${resolved}?${qs}` : resolved;
}

export function isEndpoint(value: unknown): value is AnyEndpoint {
  return (
    typeof value === 'object' &&
    value !== null &&
    'method' in value &&
    'fullPath' in value &&
    typeof (value as { fullPath: unknown }).fullPath === 'string'
  );
}
