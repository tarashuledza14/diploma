import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import type { User } from '@shared'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from 'src/user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private usersService: UserService
	) {
		const secret = configService.get<string>('JWT_SECRET');
		if (!secret) {
			throw new Error('JWT_SECRET is not defined in environment variables');
		}
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: secret,
		})
	}

	async validate({ id }: Pick<User, 'id'>) {
		return await this.usersService.findById(id)
	}
}
