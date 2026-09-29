import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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
}