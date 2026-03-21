import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './controllers/chat.controller';
import { DocumentController } from './controllers/document.controller';
import { LangchainIntegrationService } from './graph/langchain-integration.service';
import { DbNodeService } from './graph/nodes/db.node';
import { RagNodeService } from './graph/nodes/rag.node';
import { SupervisorNodeService } from './graph/nodes/supervisor.node';
import { DocumentParserService } from './services/document-parser.service';
import { EmbeddingsService } from './services/embeddings.service';
import { QdrantService } from './services/qdrant.service';

@Module({
	imports: [PrismaModule],
	controllers: [DocumentController, ChatController],
	providers: [
		LangchainIntegrationService,
		DbNodeService,
		RagNodeService,
		SupervisorNodeService,
		DocumentParserService,
		EmbeddingsService,
		QdrantService,
	],
})
export class LangchainIntegrationModule {}
