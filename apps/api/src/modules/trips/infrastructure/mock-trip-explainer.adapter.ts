import { Injectable } from '@nestjs/common';
import type { TripExplanation } from '@know-your-route/contracts';
import type { TripContext } from '../domain/trip-context';
import type { TripExplainer } from '../domain/trip-explainer.port';

@Injectable()
export class MockTripExplainerAdapter implements TripExplainer {
  async explain(context: TripContext): Promise<TripExplanation> {
    const { vehicle, route } = context;

    return {
      headline: `Optimal Route via ${route.name}`,
      rationale: `We analyzed 2 candidate corridors. The recommended route saves approx ${route.traffic.delayMinutes} mins in bottlenecks and offers 85% multi-lane expressway quality, perfectly matched for your ${vehicle.make} ${vehicle.model}.`,
      keyHighlights: [
        `Toll plazas fully covered by electronic FASTag (${route.toll.currency} ${route.toll.totalCost}).`,
        `Estimated energy consumption is ${route.energy.estimatedConsumption} ${route.energy.consumptionUnit.toLowerCase()}, well within your current fuel capacity.`,
        `Selected stop at ${route.usefulStops[0]?.name || 'Expressway Hub'} matches your refueling and refreshment schedule.`,
      ],
      safetyAdvisories: [
        'Night driving safety rating is high with active expressway patrols.',
        'Watch for minor lane merges at toll approaches.',
      ],
      fuelEfficiencyTip:
        'Maintaining cruising speed between 80-90 km/h will yield optimum fuel economy of ~15.2 km/l.',
      stopRecommendations: [
        'Stop 1: HPCL AutoCare & Electric Fast Hub at 55 km marker for quick coffee and tire pressure check.',
      ],
    };
  }
}
