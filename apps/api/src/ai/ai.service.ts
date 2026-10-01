import { Injectable, Inject } from '@nestjs/common';
import { AI_PROVIDER, IAIProvider } from './ai.interface';
import { TripContext, TripExplanation } from '@know-your-route/types';

@Injectable()
export class AIService {
  constructor(@Inject(AI_PROVIDER) private aiProvider: IAIProvider) {}

  async explainTrip(context: TripContext): Promise<TripExplanation> {
    return this.aiProvider.generateTripExplanation(context);
  }
}
