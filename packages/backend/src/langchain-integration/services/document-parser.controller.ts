import {
	BadRequestException,
	Body,
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentParserService } from '../services/document-parser.service';

@Controller('manuals')
export class DocumentParserController {
	constructor(private readonly parserService: DocumentParserService) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file')) // 'file' - це назва поля у Postman
	async uploadManual(
		@UploadedFile() file: Express.Multer.File,
		@Body('carModel') carModel: string,
	) {
		if (!file) {
			throw new BadRequestException('Файл не завантажено!');
		}
		if (!carModel) {
			throw new BadRequestException('Вкажіть марку авто (carModel)!');
		}

		// Віддаємо файл нашому AI-парсеру
		return await this.parserService.processAndStoreManual(file, carModel);
	}
}
