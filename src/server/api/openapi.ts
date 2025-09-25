import { generateOpenApiDocument } from 'better-trpc-openapi';
import { appRouter } from '~/server/api/root';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'API 문서',
  description: 'OpenAPI compliant REST API built using tRPC with Next.js',
  version: '1.0.0',
  // baseUrl: 'http://localhost/api',
  baseUrl: 'https://4cut.us/api',
  docsUrl: 'https://4cut.us/api/openapi.json',
  tags: ['account', 's3'],
});
