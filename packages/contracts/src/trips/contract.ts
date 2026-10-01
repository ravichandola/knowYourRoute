import { createEndpointFactory } from '../http';
import { createTripSchema } from './schemas';
import type { Trip, TripExplanation } from './types';

const TRIPS_BASE_PATH = 'trips';
const e = createEndpointFactory(TRIPS_BASE_PATH);

export const tripsContract = {
  basePath: TRIPS_BASE_PATH,
  list: e.get<Trip[]>()(''),
  create: e.post<Trip>()('', { body: createTripSchema }),
  get: e.get<Trip>()('/:id'),
  explain: e.get<TripExplanation>()('/:id/explain'),
} as const;
