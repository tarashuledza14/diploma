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
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorators';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { LangchainIntegrationService } from '../graph/langchain-integration.service';

@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
@Controller('chat')
export class ChatController {
	constructor(private readonly langchainService: LangchainIntegrationService) {}

	@Get('sessions')
	getSessions(@CurrentUser() user: AuthUser) {
		return this.langchainService.getChatSessions(user.id);
	}

	@Post('sessions')
	createSession(
		@Body('title') title: string | undefined,
		@CurrentUser() user: AuthUser,
	) {
		return this.langchainService.createChatSession(user.id, title);
	}

	@Get('sessions/:chatId/messages')
	getMessages(@Param('chatId') chatId: string, @CurrentUser() user: AuthUser) {
		return this.langchainService.getChatMessages(chatId, user.id);
	}

	@Delete('sessions/:chatId')
	deleteSession(
		@Param('chatId') chatId: string,
		@CurrentUser() user: AuthUser,
	) {
		return this.langchainService.deleteChatSession(chatId, user.id);
	}

	@Sse('stream')
	stream(
		@Query('chatId') chatId: string,
		@Query('message') message: string,
		@CurrentUser() user: AuthUser,
	) {
		return this.langchainService.process(chatId, message, user.id);
	}
}
