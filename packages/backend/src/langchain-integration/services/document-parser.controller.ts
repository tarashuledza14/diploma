import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorators';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { NotificationsService } from 'src/notifications/notifications.service';
import { DocumentParserService } from '../services/document-parser.service';

@Controller('manuals')
export class DocumentParserController {
	constructor(
		private readonly parserService: DocumentParserService,
		private readonly notificationsService: NotificationsService,
	) {}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Post('upload')
	@UseInterceptors(FileInterceptor('file')) // 'file' - це назва поля у Postman
	async uploadManual(
		@UploadedFile() file: Express.Multer.File,
		@Body('carModel') carModel: string,
		@CurrentUser() user: AuthUser,
	) {
		if (!file) {
			throw new BadRequestException('Файл не завантажено!');
		}
		if (!carModel) {
			throw new BadRequestException('Вкажіть марку авто (carModel)!');
		}

		try {
			// Віддаємо файл нашому AI-парсеру
			const result = await this.parserService.processAndStoreManual(file, carModel);

			await this.notificationsService.notify({
				userId: user.id,
				role: user.role,
				title: 'Обробка мануалу завершена',
				message: `Мануал "${file.originalname}" (${carModel}) успішно оброблено.`,
				metadata: {
					manualId: result.manual.id,
					chunksProcessed: result.chunksProcessed,
					filename: result.manual.filename,
					carModel,
				},
			});

			return result;
		} catch (error) {
			await this.notificationsService.notify({
				userId: user.id,
				role: user.role,
				title: 'Обробка мануалу завершена з помилкою',
				message: `Не вдалося обробити мануал "${file.originalname}" (${carModel}).`,
				metadata: {
					filename: file.originalname,
					carModel,
					status: 'failed',
				},
			});

			throw error;
		}
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get()
	getManuals(@Query('search') search?: string) {
		return this.parserService.getManuals(search);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get(':id/open')
	openManual(@Param('id') id: string) {
		return this.parserService.getManualOpenLink(id);
	}
}
