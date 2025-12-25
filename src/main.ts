import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import { AppModule } from './app.module';
import { registerShortCircuitParsers } from './common/fastify/short-circuit-parsers';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiValidationPipe } from './common/pipes/validation-pipe';
import { corsOptions } from './config/cors.config';

let app: NestFastifyApplication | null = null;
let appInitPromise: Promise<NestFastifyApplication> | null = null;
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
const isLocal = process.env.FUNCTIONS_EMULATOR
  || (!process.env.FUNCTION_NAME
    && !process.env.K_SERVICE
    && ['development', 'staging', 'production'].includes(env));

async function bootstrap(): Promise<NestFastifyApplication> {
  console.log('===> 1. Init bootstrap');
  if (app) {
    return app;
  }

  const adapter = new FastifyAdapter({ trustProxy: true });
  console.log('===> 2. Fastify Adapter');

  app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bodyParser: false,
  });

  const fastify = app.getHttpAdapter().getInstance();
  console.log('===> 3. After getInstance');

  fastify.get('/health', async (_req, reply) => {
    reply.code(200).send({ status: 'ok' });
  });

  if (!isLocal) {
    console.log(
      'Running in production mode - registering short-circuit body parsers',
    );
    registerShortCircuitParsers(fastify);
    console.log('===> 4. After remove the circuit parsers');
  } else {
    console.log(
      'Running in local mode - default Fastify body parsers are kept',
    );

    // Preserve raw body for Stripe webhooks using preHandler hook
    fastify.addHook('preParsing', async (request: any, reply, payload) => {
      if (request.url?.includes('/stripe/webhook')) {
        const chunks: Buffer[] = [];
        for await (const chunk of payload) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        request.rawBody = buffer;

        // Return the buffer as a readable stream for parsing
        const { Readable } = await import('stream');
        return Readable.from([buffer]);
      }
      return payload;
    });
  }

  // Swagger setup
  const apiBase = process.env.API_BASE_PATH || '/api';
  const cfg = new DocumentBuilder()
    .setTitle('Company API')
    .setDescription('NeedList.ORG Swagger API documentation')
    .setVersion('1.0')
    .addServer(apiBase)
    .build();

  const document = SwaggerModule.createDocument(app, cfg);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix(apiBase.replace(/^\//, ''));
  app.enableCors(corsOptions);
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: false,
  //     transform: true,
  //     transformOptions: { enableImplicitConversion: true },
  //   }),
  // );

  app.useGlobalPipes(new ApiValidationPipe());
  app.useGlobalFilters(new ApiExceptionFilter());

  // Add raw body parser for Stripe webhooks

  await app.init();
  await fastify.ready();

  return app;
}

function getApi() {
  if (!app) {
    console.log('==> initializing the bootstrap');
    appInitPromise = bootstrap().then((nestApp) => (app = nestApp));
  }
  console.log('===> xxxx. getting outside');
  return functions.https.onRequest(
    { secrets: ['SERVICE_ACCOUNT_JSON'] },
    async (req, res) => {
      try {
        const nestApp = await appInitPromise!;
        const fastify = nestApp.getHttpAdapter().getInstance();
        fastify.server.emit('request', req, res);
      } catch (err) {
        console.error('❌ Bootstrap failed:', err);
        res.status(500).send('Internal Server Error');
      }
    },
  );
}

export const api = getApi();

if (isLocal) {
  bootstrap().then(async (nestApp) => {
    const port = process.env.PORT || 3000;
    await nestApp.listen(port, '0.0.0.0');
    console.log(`local api  → http://localhost:${port}/api`);
    console.log(`swagger    → http://localhost:${port}/docs`);
  });
}
