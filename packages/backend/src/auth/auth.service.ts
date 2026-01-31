import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { Response } from 'express';
import { User } from 'prisma/generated/prisma/client';
import { UserService } from 'src/user/user.service';
import { AuthDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
	readonly EXPIRE_DAY_REFRESH_TOKEN = 1;
	readonly REFRESH_TOKEN_NAME = 'refreshToken';

	constructor(
		private userService: UserService,
		private jwtService: JwtService,
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto);
		const tokens = await this.issueTokens(user.id);

		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}
	async register(dto: RegisterDto) {
		const existUser = await this.userService.findByEmail(dto.email);
		if (existUser) throw new BadRequestException('User already exist!');
		const hashedPassword = await hash(dto.password);
		const user = await this.userService.create({
			...dto,
			password: hashedPassword,
		});

		const tokens = await this.issueTokens(user.id);

		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwtService.verifyAsync(refreshToken);
		if (!result) throw new UnauthorizedException('Invalid refresh token');

		const user = await this.userService.findById(result.id);

		const tokens = await this.issueTokens(user.id);

		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}
	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expireIn = new Date();
		expireIn.setDate(expireIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: 'localhost',
			expires: expireIn,
			secure: true,
			sameSite: 'none',
		});
	}
	removeRefreshTokenToResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: 'localhost',
			expires: new Date(0),
			secure: true,
			sameSite: 'none',
		});
	}

	private async issueTokens(userId: string) {
		const data = { id: userId };

		const accessToken = this.jwtService.sign(data, {
			expiresIn: '1h',
		});
		const refreshToken = this.jwtService.sign(data, {
			expiresIn: '14d',
		});

		return { accessToken, refreshToken };
	}
	private async validateUser(dto: AuthDto) {
		const user = await this.userService.findByEmail(dto.email);
		if (!user) throw new NotFoundException('User not found');

		const isValid = await verify(user.password, dto.password);

		if (!isValid) throw new UnauthorizedException('User not authorized');

		return user;
	}

	private returnUserFields(user: User) {
		return {
			id: user.id,
			fullName: user.fullName,
			email: user.email,
			roles: user.role,
		};
	}
}
