import { FastifyInstance } from 'fastify';

// src/common/fastify/short-circuit-parsers.ts
export function registerShortCircuitParsers(fastify: FastifyInstance) {
  fastify.removeAllContentTypeParsers();

  const shortCircuit = (req: any, body: any, done: any) => {
    const val = req?.body ?? req?.rawBody ?? (body && body.body);
    try {
      if (Buffer.isBuffer(val)) {
        return done(null, JSON.parse(val.toString('utf8') || '{}'));
      }
      if (typeof val === 'string') {
        return done(null, JSON.parse(val || '{}'));
      }
      if (val && typeof val === 'object') {
        return done(null, JSON.parse(JSON.stringify(val)));
      }
      return done(null, {});
    } catch (err) {
      err.statusCode = 400;
      return done(err, undefined); // We should never throw errors inside a content parser
    }
  };

  fastify.addContentTypeParser('application/json', shortCircuit);
  fastify.addContentTypeParser('application/*+json', shortCircuit);
  fastify.addContentTypeParser(
    'application/x-www-form-urlencoded',
    shortCircuit,
  );
  fastify.addContentTypeParser('*', shortCircuit);
}
