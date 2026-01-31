import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
	constructor(private readonly db: PrismaService) {}

	async create(data: CreateClientDto) {
		return this.db.client.create({
			data,
		});
	}
}
