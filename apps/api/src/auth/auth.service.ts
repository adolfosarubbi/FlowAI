import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordIsValid = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessTokenExpiry = (process.env.JWT_ACCESS_EXPIRY ?? '15m') as StringValue;

    const accessToken = await this.jwtService.signAsync(
      {
        email: user.email,
      },
      {
        subject: user.id,
        expiresIn: accessTokenExpiry,
      },
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenExpiry,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      memberships: user.memberships.map((membership) => ({
        workspace: {
          id: membership.workspace.id,
          name: membership.workspace.name,
          slug: membership.workspace.slug,
        },
        role: membership.role,
      })),
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const workspaceSlug = await this.generateUniqueWorkspaceSlug(dto.workspaceName);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: dto.workspaceName.trim(),
          slug: workspaceSlug,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: Role.ADMIN,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
        },
        membership: {
          role: membership.role,
        },
      };
    });
  }

  private async generateUniqueWorkspaceSlug(name: string): Promise<string> {
    const baseSlug =
      name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'workspace';

    let slug = baseSlug;
    let suffix = 2;

    while (
      await this.prisma.workspace.findUnique({
        where: { slug },
        select: { id: true },
      })
    ) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }
}
