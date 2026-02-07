import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
	ValidationPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { GetClientsDto } from './dto/get-clients.dto';

@Controller('clients')
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) {}

	@Get()
	async getClients(
		@Query(new ValidationPipe({ transform: true }))
		query: GetClientsDto,
	) {
		return this.clientsService.getClients(query);
	}

	@Post()
	async createClient(@Body() data: CreateClientDto) {
		return this.clientsService.create(data);
	}

	@Delete(':id')
	async deleteClient(@Param('id') id: string) {
		return this.clientsService.delete(id);
	}
	@Delete()
	async deleteClientsBulk(@Body('ids') clientIds: string[]) {
		return this.clientsService.deleteBulk(clientIds);
	}

	@Put(':id')
	async updateClient(
		@Param('id') id: string,
		@Body() data: Partial<CreateClientDto>,
	) {
		return this.clientsService.update(id, data);
	}

	@Get(':id')
	async getClientDetails(@Param('id') id: string) {
		return this.clientsService.getClientDetails(id);
	}
}
