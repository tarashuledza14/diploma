import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { Auth } from './decorators/auth.decorator'
import { AuthDto, RegisterDto } from './dto/auth.dto'

@Controller('auth')
export class AuthController {

	constructor(private authService: AuthService) {}
	
	@HttpCode(HttpStatus.OK)
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
	@Post('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		this.authService.removeRefreshTokenToResponse(res)
		return true
	}
	
	@HttpCode(200)
	@Post('register')
	async register(
		@Body() dto: RegisterDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { refreshToken, ...response } = await this.authService.register(dto)
		this.authService.addRefreshTokenToResponse(res, refreshToken)
		return response
	}
	// @UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('access-token')
	async getNewTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshTokenFromCookies = req.cookies([
			this.authService.REFRESH_TOKEN_NAME
		])
		if (!refreshTokenFromCookies) {
			this.authService.removeRefreshTokenToResponse(res)
			throw new UnauthorizedException('Refresh token not passed')
		}

		const { refreshToken, ...response } = await this.authService.getNewTokens(
			refreshTokenFromCookies
		)

		return response
	}
}
