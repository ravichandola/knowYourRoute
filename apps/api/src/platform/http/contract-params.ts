import { Body, Query } from '@nestjs/common';
import type { Endpoint } from '@know-your-route/contracts';
import { ZodValidationPipe } from './zod-validation.pipe';

type AnyEndpointOf<TBody, TQuery> = Endpoint<unknown, TBody, TQuery, string>;

/** Request body validated with the exact schema declared in the endpoint contract. */
export function ContractBody<TBody>(endpoint: AnyEndpointOf<TBody, unknown>): ParameterDecorator {
  if (!endpoint.bodySchema) {
    throw new Error(`${endpoint.method} ${endpoint.fullPath} has no body schema in its contract`);
  }
  return Body(new ZodValidationPipe(endpoint.bodySchema));
}

/** Query string validated/coerced with the schema declared in the endpoint contract. */
export function ContractQuery<TQuery>(
  endpoint: AnyEndpointOf<unknown, TQuery>
): ParameterDecorator {
  if (!endpoint.querySchema) {
    throw new Error(`${endpoint.method} ${endpoint.fullPath} has no query schema in its contract`);
  }
  return Query(new ZodValidationPipe(endpoint.querySchema));
}
