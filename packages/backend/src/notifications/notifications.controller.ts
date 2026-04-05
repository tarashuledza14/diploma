import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorators';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { NotificationsService } from './notifications.service';

@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Get()
	getMyNotifications(
		@CurrentUser() user: AuthUser,
		@Query('limit') limit?: string,
	) {
		const parsedLimit = limit ? Number(limit) : 50;
		return this.notificationsService.getUserNotifications(user.id, parsedLimit);
	}

	@Get('unread-count')
	getUnreadCount(@CurrentUser() user: AuthUser) {
		return this.notificationsService.getUnreadCount(user.id);
	}

	@Patch(':id/read')
	markAsRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
		return this.notificationsService.markAsRead(user.id, id);
	}

	@Patch('read-all')
	markAllAsRead(@CurrentUser() user: AuthUser) {
		return this.notificationsService.markAllAsRead(user.id);
	}
}
