import { createEndpointFactory } from '../http';
import { fastagStatusQuerySchema, fastagVerifyQuerySchema } from './schemas';
import type { FastagContext } from './types';
import type { FastagStatusQuery, FastagVerifyQuery } from './schemas';

const FASTAG_BASE_PATH = 'fastag';
const e = createEndpointFactory(FASTAG_BASE_PATH);

export const fastagContract = {
  basePath: FASTAG_BASE_PATH,
  myStatus: e.get<FastagContext, FastagStatusQuery>()('/me/status', {
    query: fastagStatusQuerySchema,
  }),
  myVerify: e.get<FastagContext, FastagVerifyQuery>()('/me/verify', {
    query: fastagVerifyQuerySchema,
  }),
  tagStatus: e.get<FastagContext>()('/:tagNumber/status'),
  tagVerify: e.get<FastagContext, FastagVerifyQuery>()('/:tagNumber/verify', {
    query: fastagVerifyQuerySchema,
  }),
} as const;
