import type { TripExplanation } from '@know-your-route/contracts';
import type { TripContext } from './trip-context';

export const TRIP_EXPLAINER = 'TRIP_EXPLAINER';

/** Port: the AI service that turns a trip into a human explanation. */
export interface TripExplainer {
  explain(context: TripContext): Promise<TripExplanation>;
}
