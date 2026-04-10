import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	process.env.LANGSMITH_TRACING = 'false';
	process.env.LANGCHAIN_TRACING = 'false';
	process.env.LANGCHAIN_TRACING_V2 = 'false';
	process.env.LANGSMITH_ENDPOINT = '';
	process.env.LANGCHAIN_ENDPOINT = '';
	delete process.env.LANGSMITH_API_KEY;
	delete process.env.LANGCHAIN_API_KEY;
	delete process.env.LANGSMITH_PROJECT;
	delete process.env.LANGCHAIN_PROJECT;

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
