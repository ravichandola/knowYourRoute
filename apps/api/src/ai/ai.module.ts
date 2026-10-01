import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AI_PROVIDER } from './ai.interface';
import { MockAIAdapter } from './mock-ai.adapter';
import { AIService } from './ai.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    MockAIAdapter,
    AIService,
    {
      provide: AI_PROVIDER,
      useFactory: (config: ConfigService, mock: MockAIAdapter) => {
        return mock;
      },
      inject: [ConfigService, MockAIAdapter],
    },
  ],
  exports: [AIService, AI_PROVIDER],
})
export class AIModule {}
