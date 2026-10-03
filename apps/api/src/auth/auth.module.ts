import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WorkspaceContextGuard } from './workspace/workspace-context.guard';
import { RolesGuard } from './roles/roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_ACCESS_SECRET;

        if (!secret) {
          throw new Error('JWT_ACCESS_SECRET is required');
        }

        return { secret };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, WorkspaceContextGuard, RolesGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
