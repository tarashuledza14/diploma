import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DmsModule } from 'src/dms/dms.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './controllers/chat.controller';
import { DocumentController } from './controllers/document.controller';
import { LangchainIntegrationService } from './graph/langchain-integration.service';
import { DbNodeService } from './graph/nodes/db-node/db.node';
import { RagNodeService } from './graph/nodes/rag-node/rag.node';
import { SupervisorNodeService } from './graph/nodes/supervisor.node';
import { DocumentParserController } from './services/document-parser.controller';
import { DocumentParserService } from './services/document-parser.service';
import { EmbeddingsService } from './services/embeddings.service';
import { QdrantService } from './services/qdrant.service';

@Module({
	imports: [ConfigModule, PrismaModule, DmsModule],
	controllers: [DocumentController, ChatController, DocumentParserController],
	providers: [
		LangchainIntegrationService,
		DbNodeService,
		RagNodeService,
		SupervisorNodeService,
		DocumentParserService,
		EmbeddingsService,
		QdrantService,
	],
	exports: [EmbeddingsService, QdrantService],
})
export class LangchainIntegrationModule {}
