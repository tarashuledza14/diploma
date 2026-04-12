import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'prisma/generated/prisma/client';
import { UserService } from 'src/user/user.service';
import { AuthUser } from './types/auth-user.type';

function extractJwtFromAccessTokenCookie(req: Request): string | null {
	const rawCookieHeader = req?.headers?.cookie;
	if (!rawCookieHeader) {
		return null;
	}

	const cookies = rawCookieHeader.split(';');
	for (const cookie of cookies) {
		const [name, ...rest] = cookie.trim().split('=');
		if (name !== 'accessToken') {
			continue;
		}

		const value = rest.join('=');
		return value ? decodeURIComponent(value) : null;
	}

	return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private usersService: UserService,
	) {
		const secret = configService.get<string>('JWT_SECRET');
		if (!secret) {
			throw new Error('JWT_SECRET is not defined in environment variables');
		}
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				ExtractJwt.fromAuthHeaderAsBearerToken(),
				extractJwtFromAccessTokenCookie,
			]),
			ignoreExpiration: false,
			secretOrKey: secret,
		});
	}

	async validate({ id }: Pick<User, 'id'>): Promise<AuthUser> {
		const user = await this.usersService.findById(id);
		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		return {
			id: user.id,
			email: user.email,
			fullName: user.fullName,
			role: user.role,
			organizationId: user.organizationId,
		};
	}
}
