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
	) {
		return this.clientsService.getClients(query);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Post()
	async createClient(@Body() data: CreateClientDto) {
		return this.clientsService.create(data);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete(':id')
	async deleteClient(@Param('id') id: string) {
		return this.clientsService.delete(id);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete()
	async deleteClientsBulk(@Body('ids') clientIds: string[]) {
		return this.clientsService.deleteBulk(clientIds);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Put(':id')
	async updateClient(
		@Param('id') id: string,
		@Body() data: Partial<CreateClientDto>,
	) {
		return this.clientsService.update(id, data);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get(':id')
	async getClientDetails(@Param('id') id: string) {
		return this.clientsService.getClientDetails(id);
	}
}
