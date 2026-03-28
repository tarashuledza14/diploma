import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	Sse,
} from '@nestjs/common';
import { LangchainIntegrationService } from '../graph/langchain-integration.service';

@Controller('chat')
export class ChatController {
	constructor(private readonly langchainService: LangchainIntegrationService) {}

	@Get('sessions')
	getSessions() {
		return this.langchainService.getChatSessions();
	}

	@Post('sessions')
	createSession(@Body('title') title?: string) {
		return this.langchainService.createChatSession(title);
	}

	@Get('sessions/:chatId/messages')
	getMessages(@Param('chatId') chatId: string) {
		return this.langchainService.getChatMessages(chatId);
	}

	@Delete('sessions/:chatId')
	deleteSession(@Param('chatId') chatId: string) {
		return this.langchainService.deleteChatSession(chatId);
	}

	@Sse('stream')
	stream(@Query('chatId') chatId: string, @Query('message') message: string) {
		return this.langchainService.process(chatId, message);
	}
}
