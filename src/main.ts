import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import { environment } from './shared/environment';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { TransformInterceptor } from './shared/interceptors/transform.interceprtor';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fingerprint = require('express-fingerprint');

(async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    Fingerprint({
      parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders, Fingerprint.geoip],
    }),
  );
  app
    .setGlobalPrefix('api')
    .useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    .useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    .useGlobalFilters(new HttpExceptionFilter())
    .useGlobalInterceptors(new ResponseInterceptor())
    .useGlobalInterceptors(new TransformInterceptor())
    .enableCors(corsConfig);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Swagger Project')
    .setDescription('Project API routes')
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

  await app.listen(environment.app.port);
})();
