import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WorkspaceContextGuard } from './workspace/workspace-context.guard';
import { Role } from '@prisma/client';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/roles.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user and create their workspace',
  })
  @ApiCreatedResponse({
    description: 'User, workspace and admin membership created successfully',
  })
  @ApiConflictResponse({
    description: 'Email already registered',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate a user and return an access token',
  })
  @ApiOkResponse({
    description: 'User authenticated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Return the currently authenticated user',
  })
  @ApiOkResponse({
    description: 'Authenticated user returned successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or access token is invalid',
  })
  me(@Req() request: Request) {
    return {
      user: request.user,
    };
  }

  @Get('workspace')
  @UseGuards(JwtAuthGuard, WorkspaceContextGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Return the current validated workspace context',
  })
  @ApiOkResponse({
    description: 'Workspace context returned successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or access token is invalid',
  })
  meWorkspace(@Req() request: Request) {
    return {
      workspace: request.workspace,
    };
  }
}
