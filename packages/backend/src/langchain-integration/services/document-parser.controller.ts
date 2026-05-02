import {
	BadRequestException,
	Body,
	Controller,
	Delete,
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

		const normalizedFileName = this.normalizeUploadedFileName(
			file.originalname,
		);
		file.originalname = normalizedFileName;
		const organizationId = this.requireOrganizationId(user);

		try {
			// Віддаємо файл нашому AI-парсеру
			const result = await this.parserService.processAndStoreManual(
				file,
				carModel,
				organizationId,
			);
			const smartFilter = result?.smartFilter || null;
			const isDebugMode = Boolean(result?.debugMode);

			await this.notificationsService.notify({
				userId: user.id,
				role: user.role,
				title: isDebugMode
					? 'Smart filter перевірка завершена'
					: 'Обробка посібника завершена',
				message: isDebugMode
					? `Файл "${file.originalname}" (${carModel}) проаналізовано в debug-режимі smart filter.`
					: `Посібник "${file.originalname}" (${carModel}) успішно оброблено.`,
				metadata: {
					filename: file.originalname,
					carModel,
					debugMode: isDebugMode,
					smartFilter,
				},
			});

			return result;
		} catch (error) {
			await this.notificationsService.notify({
				userId: user.id,
				role: user.role,
				title: 'Обробка посібника завершена з помилкою',
				message: `Не вдалося обробити посібник "${file.originalname}" (${carModel}).`,
				metadata: {
					filename: file.originalname,
					carModel,
					status: 'failed',
				},
			});

			throw error;
		}
	}

	private normalizeUploadedFileName(fileName: string) {
		const containsMojibake = /[ÐÑ]/.test(fileName);
		if (!containsMojibake) {
			return fileName;
		}

		try {
			return Buffer.from(fileName, 'latin1').toString('utf8');
		} catch {
			return fileName;
		}
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get()
	getManuals(
		@Query('search') search: string | undefined,
		@CurrentUser() user: AuthUser,
	) {
		return this.parserService.getManuals(
			this.requireOrganizationId(user),
			search,
		);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get(':id/open')
	openManual(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.parserService.getManualOpenLink(
			id,
			this.requireOrganizationId(user),
		);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete(':id')
	async deleteManual(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		const organizationId = this.requireOrganizationId(user);
		try {
			const deletedManual = await this.parserService.deleteManual(
				id,
				organizationId,
			);
			const storageCleanupPending = Boolean(
				deletedManual.storageCleanupPending,
			);

			await this.notificationsService.notify({
				userId: user.id,
				role: user.role,
				title: storageCleanupPending
					? 'Посібник видалено (S3 cleanup pending)'
					: 'Посібник видалено',
				message: storageCleanupPending
					? `Посібник "${deletedManual.filename}" видалено з системи, але файл в S3 поки не видалено через відсутній доступ DeleteObject.`
					: `Посібник "${deletedManual.filename}" успішно видалено.`,
				metadata: {
					manualId: deletedManual.id,
					filename: deletedManual.filename,
					carModel: deletedManual.carModel,
					storageCleanupPending,
				},
			});

			return {
				success: true,
				storageCleanupPending,
			};
		} catch (error) {
			await this.notificationsService.notify({
				userId: user.id,
				role: user.role,
				title: 'Помилка видалення посібника',
				message: `Не вдалося видалити посібник (id: ${id}).`,
				metadata: {
					manualId: id,
					status: 'failed',
				},
			});

			throw error;
		}
	}

	private requireOrganizationId(user: AuthUser) {
		if (!user.organizationId) {
			throw new BadRequestException('Користувач не привʼязаний до організації');
		}

		return user.organizationId;
	}
}
