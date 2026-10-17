import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  await mkdir(join(process.cwd(), 'uploads', 'thumbs'), { recursive: true });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('x-powered-by');
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(cookieParser());
  app.set('trust proxy', 1);
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = configuredOrigins?.length ? configuredOrigins : [
    'http://localhost:4200', 'http://localhost:4000',
    'https://crefolio.vercel.app',
    'http://app.local.test:4200', 'http://app.local.test:4000',
  ];
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || !/\b(accessToken|refreshToken)=/.test(req.headers.cookie ?? '')) return next();
    let source = req.headers.origin;
    if (!source && req.headers.referer) {
      try { source = new URL(req.headers.referer).origin; } catch { /* Reject malformed origins below. */ }
    }
    if (!source || !allowedOrigins.includes(source)) return res.status(403).json({ message: 'Request origin is not allowed' });
    return next();
  });
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? '0.0.0.0');
}
void bootstrap();
