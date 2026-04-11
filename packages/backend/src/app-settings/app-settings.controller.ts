import {
	Body,
	Controller,
	Get,
	Patch,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from 'prisma/generated/prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { AppSettingsService } from './app-settings.service';
import { UpdateAppBrandingDto } from './dto/update-app-branding.dto';

@Controller('app-settings')
export class AppSettingsController {
	constructor(private readonly appSettingsService: AppSettingsService) {}

	@UseGuards(JwtAuthGuard)
	@Get('branding')
	getBranding(@CurrentUser() user: AuthUser) {
		return this.appSettingsService.getBranding(user.organizationId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.ADMIN)
	@Patch('branding')
	updateBranding(
		@CurrentUser() user: AuthUser,
		@Body() dto: UpdateAppBrandingDto,
	) {
		return this.appSettingsService.updateBranding(user.organizationId, dto);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.ADMIN)
	@Post('logo')
	@UseInterceptors(FileInterceptor('file'))
	uploadLogo(
		@CurrentUser() user: AuthUser,
		@UploadedFile() file: Express.Multer.File,
	) {
		return this.appSettingsService.uploadLogo(user.organizationId, file);
	}
}
