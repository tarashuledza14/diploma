import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';

interface JwtPayload {
	id: string;
}

@Injectable()
@WebSocketGateway({
	namespace: '/notifications',
	cors: {
		origin: 'http://localhost:5173',
		credentials: true,
	},
})
export class NotificationsGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	private readonly logger = new Logger(NotificationsGateway.name);

	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly configService: ConfigService,
	) {}

	async handleConnection(@ConnectedSocket() client: Socket) {
		const token = this.extractToken(client);
		if (!token) {
			client.disconnect();
			return;
		}

		const user = await this.validateUserByToken(token);
		if (!user) {
			client.disconnect();
			return;
		}

		const room = this.getUserRoom(user.id);
		client.data.userId = user.id;
		await client.join(room);
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		const userId = client.data?.userId;
		if (!userId) {
			return;
		}
		this.logger.debug(`Socket disconnected for user ${userId}`);
	}

	sendToUser(userId: string, notification: unknown) {
		this.server
			.to(this.getUserRoom(userId))
			.emit('new_notification', notification);
	}

	private getUserRoom(userId: string) {
		return `user:${userId}`;
	}

	private extractToken(client: Socket): string | null {
		const authToken = client.handshake.auth?.token;
		if (typeof authToken === 'string' && authToken.trim()) {
			return authToken;
		}

		const queryToken = client.handshake.query?.token;
		if (typeof queryToken === 'string' && queryToken.trim()) {
			return queryToken;
		}

		const authHeader = client.handshake.headers?.authorization;
		if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
			return authHeader.slice(7).trim();
		}

		return null;
	}

	private async validateUserByToken(token: string) {
		const secret = this.configService.get<string>('JWT_SECRET');
		if (!secret) {
			return null;
		}

		try {
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
				secret,
			});
			if (!payload?.id) {
				return null;
			}
			return this.userService.findById(payload.id);
		} catch {
			return null;
		}
	}
}
