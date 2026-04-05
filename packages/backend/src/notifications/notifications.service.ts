import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma, Role } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

interface NotifyInput {
	userId: string;
	role: Role;
	message: string;
	title?: string;
	type?: NotificationType;
	metadata?: Prisma.InputJsonValue | null;
}

@Injectable()
export class NotificationsService {
	constructor(
		private readonly db: PrismaService,
		private readonly gateway: NotificationsGateway,
	) {}

	async notify(input: NotifyInput) {
		const formattedMessage = `${this.getRolePrefix(input.role)} ${input.message}`;

		const notification = await this.db.notification.create({
			data: {
				userId: input.userId,
				type: input.type ?? 'SYSTEM',
				title: input.title,
				message: formattedMessage,
				metadata: input.metadata ?? undefined,
			},
			select: {
				id: true,
				userId: true,
				type: true,
				title: true,
				message: true,
				metadata: true,
				isRead: true,
				createdAt: true,
			},
		});

		this.gateway.sendToUser(input.userId, notification);
		return notification;
	}

	async getUserNotifications(userId: string, limit = 50) {
		return this.db.notification.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			take: Math.min(Math.max(limit, 1), 200),
		});
	}

	async getUnreadCount(userId: string) {
		const count = await this.db.notification.count({
			where: { userId, isRead: false },
		});
		return { unreadCount: count };
	}

	async markAsRead(userId: string, notificationId: string) {
		await this.db.notification.updateMany({
			where: { id: notificationId, userId },
			data: { isRead: true },
		});
		return { success: true };
	}

	async markAllAsRead(userId: string) {
		await this.db.notification.updateMany({
			where: { userId, isRead: false },
			data: { isRead: true },
		});
		return { success: true };
	}

	private getRolePrefix(role: Role) {
		switch (role) {
			case 'MECHANIC':
				return '🛠';
			case 'MANAGER':
				return '💼';
			case 'ADMIN':
				return '🔒';
			default:
				return '🔔';
		}
	}
}
