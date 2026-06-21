import 'newrelic';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';
const DEFAULT_PORT = 3000;

function parseCorsOrigin(origin: string): string | string[] {
  if (origin === '*') {
    return origin;
  }

  const allowedOrigins = origin
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    return DEFAULT_CORS_ORIGIN;
  }

  return allowedOrigins.length > 1 ? allowedOrigins : allowedOrigins[0];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    DEFAULT_CORS_ORIGIN,
  );
  const port = Number(configService.get<string>('PORT')) || DEFAULT_PORT;

  app.enableCors({
    origin: parseCorsOrigin(corsOrigin),
  });

  await app.listen(port, '0.0.0.0');
}
void bootstrap();
