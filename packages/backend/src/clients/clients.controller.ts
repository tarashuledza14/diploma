import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorators';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { GetClientsDto } from './dto/get-clients.dto';

@Controller('clients')
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) {}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get()
	async getClients(
		@Query()
		query: GetClientsDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.clientsService.getClients(query, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Post()
	async createClient(
		@Body() data: CreateClientDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.clientsService.create(data, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete(':id')
	async deleteClient(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.clientsService.delete(id, user);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete()
	async deleteClientsBulk(
		@Body('ids') clientIds: string[],
		@CurrentUser() user: AuthUser,
	) {
		return this.clientsService.deleteBulk(clientIds, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Put(':id')
	async updateClient(
		@Param('id') id: string,
		@Body() data: Partial<CreateClientDto>,
		@CurrentUser() user: AuthUser,
	) {
		return this.clientsService.update(id, data, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get(':id')
	async getClientDetails(
		@Param('id') id: string,
		@CurrentUser() user: AuthUser,
	) {
		return this.clientsService.getClientDetails(id, user);
	}
}
