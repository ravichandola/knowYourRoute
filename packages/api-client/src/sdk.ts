import {
  authContract,
  buildPath,
  fastagContract,
  isEndpoint,
  routesContract,
  tripsContract,
  usersContract,
  vehiclesContract,
} from '@know-your-route/contracts';
import type { Endpoint, PathParams } from '@know-your-route/contracts';
import type { BaseApiClient } from './http-client';

type Contract = { readonly basePath?: string } & Record<string, unknown>;

type BodyOf<E> = E extends Endpoint<unknown, infer B, unknown, string> ? B : never;
type QueryOf<E> = E extends Endpoint<unknown, unknown, infer Q, string> ? Q : never;
type PathOf<E> = E extends Endpoint<unknown, unknown, unknown, infer P> ? P : never;
type ResponseOf<E> = E extends Endpoint<infer R, unknown, unknown, string> ? R : never;

type CallInput<E> = (PathParams<PathOf<E>> extends undefined
  ? unknown
  : { params: PathParams<PathOf<E>> }) &
  ([BodyOf<E>] extends [undefined] ? unknown : { body: BodyOf<E> }) &
  ([QueryOf<E>] extends [undefined] ? unknown : { query: QueryOf<E> });

type EndpointCall<E> = {} extends CallInput<E>
  ? () => Promise<ResponseOf<E>>
  : (input: CallInput<E>) => Promise<ResponseOf<E>>;

type BoundContract<C extends Contract> = {
  [K in keyof C as C[K] extends Endpoint<unknown, unknown, unknown, string>
    ? K
    : never]: EndpointCall<C[K]>;
};

interface RuntimeInput {
  params?: Record<string, string>;
  body?: unknown;
  query?: Record<string, unknown>;
}

function bindContract<C extends Contract>(http: BaseApiClient, contract: C): BoundContract<C> {
  const bound: Record<string, (input?: RuntimeInput) => Promise<unknown>> = {};

  for (const [name, value] of Object.entries(contract)) {
    if (!isEndpoint(value)) {
      continue;
    }
    bound[name] = (input: RuntimeInput = {}) =>
      http.request(buildPath(value.fullPath, input.params, input.query), {
        method: value.method,
        body: input.body === undefined ? undefined : JSON.stringify(input.body),
      });
  }

  return bound as BoundContract<C>;
}

/**
 * Typed SDK generated from `@know-your-route/contracts`.
 * `api.vehicles.get({ params: { id } })` is checked against the exact same endpoint
 * definition the server controller uses.
 */
export function createApiClient(http: BaseApiClient) {
  return {
    auth: bindContract(http, authContract),
    users: bindContract(http, usersContract),
    vehicles: bindContract(http, vehiclesContract),
    routes: bindContract(http, routesContract),
    fastag: bindContract(http, fastagContract),
    trips: bindContract(http, tripsContract),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
