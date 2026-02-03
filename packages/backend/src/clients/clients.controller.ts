import { Controller, Get, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { GetClientsDto } from './dto/get-clients.dto';

@Controller('clients')
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) {}

	@Get()
	async getClients(@Query() query: GetClientsDto) {
		return this.clientsService.getClients(query);
	}
}
