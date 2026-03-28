import { Controller, Query, Sse } from '@nestjs/common';
import { LangchainIntegrationService } from '../graph/langchain-integration.service';

@Controller('chat')
export class ChatController {
	constructor(private readonly langchainService: LangchainIntegrationService) {}

	@Sse('stream')
	stream(@Query('message') message: string) {
		// Юзер заходить на: http://localhost:3000/chat/stream?message=Hello
		return this.langchainService.process(message);
	}
}
