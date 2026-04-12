import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Role } from 'prisma/generated/prisma/client';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { CurrentUser } from './decorators/user.decorators';
import { AuthDto, RegisterDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthUser } from './types/auth-user.type';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
	constructor(private authService: AuthService) {}

	private getCookieValue(req: Request, name: string): string | null {
		const rawCookieHeader = req.headers.cookie;
		if (!rawCookieHeader) {
			return null;
		}

		const cookies = rawCookieHeader.split(';');
		for (const cookie of cookies) {
			const [cookieName, ...rest] = cookie.trim().split('=');
			if (cookieName !== name) {
				continue;
			}

			const value = rest.join('=');
			return value ? decodeURIComponent(value) : null;
		}

		return null;
	}

	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { limit: 10, ttl: 60_000 } })
	@Post('login')
	async signIn(@Body() dto: AuthDto) {
		return this.authService.login(dto);
	}

	@Auth()
	@Get('profile')
	getProfile(@Req() request: any) {
		return request.user;
	}

	@HttpCode(200)
	@Throttle({ default: { limit: 30, ttl: 60_000 } })
	@Post('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		this.authService.removeRefreshTokenToResponse(res);
		return true;
	}

	@HttpCode(200)
	@Auth(Role.ADMIN)
	@Post('register')
	async register(
		@Body() dto: RegisterDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { refreshToken, ...response } = await this.authService.register(dto);
		this.authService.addRefreshTokenToResponse(res, refreshToken);
		return response;
	}
	// @UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Throttle({ default: { limit: 20, ttl: 60_000 } })
	@Post('access-token')
	async getNewTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const refreshTokenFromCookies = this.getCookieValue(
			req,
			this.authService.REFRESH_TOKEN_NAME,
		);
		if (!refreshTokenFromCookies) {
			this.authService.removeRefreshTokenToResponse(res);
			throw new UnauthorizedException('Refresh token not passed');
		}

		const { refreshToken, ...response } = await this.authService.getNewTokens(
			refreshTokenFromCookies,
		);

		return response;
	}

	@Auth()
	@Patch('password')
	changePassword(
		@CurrentUser() user: AuthUser,
		@Body() dto: ChangePasswordDto,
	) {
		return this.authService.changePassword(user.id, dto);
	}
}
