import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import { environment } from './shared/environment';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { TransformInterceptor } from './shared/interceptors/transform.interceprtor';

const Fingerprint = require('express-fingerprint');

async function bootstrap(): Promise<void> {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const logger = new Logger('Bootstrap');

    app.use(
      Fingerprint({
        parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders, Fingerprint.geoip],
      }),
    );

    // Global configurations
    app
      .setGlobalPrefix('api')
      .useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
      .useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
      .useGlobalFilters(new HttpExceptionFilter())
      .useGlobalInterceptors(new ResponseInterceptor())
      .useGlobalInterceptors(new TransformInterceptor())
      .enableCors(corsConfig);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    // Swagger configuration
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Swagger 365')
      .setDescription('365 API routes')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .setVersion('1.0')
      .setExternalDoc('JSON version', `${environment.app.backendUrl}/docs-json`)
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);

    // Start the server
    await app.listen(environment.app.port);
    logger.log(`Application is running on: ${await app.getUrl()}`);

    // Graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'];
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.warn(`${signal} signal received. Closing application...`);
        await app.close();
        process.exit(0);
      });
    }
  } catch (error) {
    Logger.error('Error during application bootstrap', error);
    process.exit(1);
  }
}
bootstrap();
