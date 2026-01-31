import { Injectable } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/generated/prisma/client'
@Injectable()
export class PrismaService extends PrismaClient {
	constructor() {
		const adapter = new PrismaPg({
			connectionString: process.env.DATABASE_URL as string,
		});
		super({ adapter });
	}
}
// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(PrismaService.name);

//   constructor() {
//     super({
//       log: process.env.NODE_ENV === 'development'
//         ? ['query', 'error', 'warn']
//         : ['error'],
//     });
//   }

//   async onModuleInit() {
//     try {
//       await this.$connect();
//       this.logger.log('Prisma connection established');
//     } catch (error) {
//       this.logger.error('Failed to connect to database', error);
//       throw error;
//     }
//   }

//   async onModuleDestroy() {
//     await this.$disconnect();
//     this.logger.log('Prisma connection closed');
//   }

// }
