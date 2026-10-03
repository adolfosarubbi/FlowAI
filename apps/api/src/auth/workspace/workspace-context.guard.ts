import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const workspaceId = request.headers['x-workspace-id'];

    if (typeof workspaceId !== 'string' || !workspaceId.trim()) {
      throw new BadRequestException('X-Workspace-Id header is required');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: request.user.id,
          workspaceId: workspaceId.trim(),
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Workspace access denied');
    }

    request.workspace = {
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      membership: {
        id: membership.id,
        role: membership.role,
      },
    };

    return true;
  }
}
