import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	// LangSmith tracing — вмикається коли LANGSMITH_API_KEY задано в .env
	const langsmithKey = process.env.LANGSMITH_API_KEY;
	if (langsmithKey && langsmithKey !== '...') {
		process.env.LANGCHAIN_TRACING_V2 = 'true';
		process.env.LANGCHAIN_API_KEY = langsmithKey;
		if (process.env.LANGSMITH_PROJECT) {
			process.env.LANGCHAIN_PROJECT = process.env.LANGSMITH_PROJECT;
		}
		console.log(`🔍 LangSmith tracing enabled (project: ${process.env.LANGSMITH_PROJECT ?? 'default'})`);
	} else {
		process.env.LANGCHAIN_TRACING_V2 = 'false';
	}

	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: 'http://localhost:5173',
		credentials: true,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			transformOptions: { enableImplicitConversion: true },
			whitelist: true,
		}),
	);

	app.setGlobalPrefix('api');
	await app.listen(4200);
}
bootstrap();
