import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../common/prisma.service';

const toExpirySeconds = (expiresIn: string): number => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) {
    return 604800;
  }
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === 's') return value;
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 3600;
  return value * 86400;
};

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev-jwt-secret-know-your-route-change-me',
        signOptions: {
          expiresIn: toExpirySeconds(config.get<string>('JWT_EXPIRES_IN') || '7d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
