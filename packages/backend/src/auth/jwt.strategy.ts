import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'prisma/generated/prisma/client';
import { UserService } from 'src/user/user.service';
import { AuthUser } from './types/auth-user.type';

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
				ExtractJwt.fromUrlQueryParameter('token'),
			]),
			ignoreExpiration: true,
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
		};
	}
}
