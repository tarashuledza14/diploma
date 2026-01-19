import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'

export const getJwtConfig = async (
	configService: ConfigService
): Promise<JwtModuleOptions> => {
	const secret = configService.get<string>('JWT_SECRET');
	if (!secret) {
		throw new Error('JWT_SECRET is not defined in environment variables');
	}
	return {
		secret,
	};
};
