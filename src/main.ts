import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { basename, extname, join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const runtimeUploads = join(process.cwd(), 'uploads');
  const demoUploads = join(__dirname, 'demo-assets');
  await mkdir(join(runtimeUploads, 'variants'), { recursive: true });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const httpLogger = new Logger('HTTP');
  app.disable('x-powered-by');
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode === 429) {
        httpLogger.warn(`${req.method} ${req.path} returned 429 for ${req.ip}`);
      } else if (res.statusCode >= 500) {
        httpLogger.error(`${req.method} ${req.path} returned ${res.statusCode} for ${req.ip}`);
      }
    });
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
  const staticOptions = {
    prefix: '/uploads',
    maxAge: 31_536_000_000,
    immutable: true,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  };
  app.useStaticAssets(runtimeUploads, staticOptions);
  app.useStaticAssets(demoUploads, staticOptions);
  app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
    const filename = basename(req.path);
    if (req.path !== `/${filename}` || !/^[-\w]+\.(?:jpe?g|png|webp)$/i.test(filename)) {
      return next();
    }

    const gallery = `${basename(filename, extname(filename))}-gallery.webp`;
    if (!existsSync(join(demoUploads, 'variants', gallery))) return next();
    return res.redirect(302, `/uploads/variants/${gallery}`);
  });
  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? '0.0.0.0');
}
void bootstrap();
