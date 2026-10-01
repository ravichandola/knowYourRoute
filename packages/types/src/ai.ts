import { TripContext } from './trip';

export interface TripExplanation {
  headline: string;
  rationale: string;
  keyHighlights: string[];
  safetyAdvisories: string[];
  fuelEfficiencyTip: string;
  stopRecommendations: string[];
}

export interface AIProvider {
  generateTripExplanation(context: TripContext): Promise<TripExplanation>;
}
