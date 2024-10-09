import { generateOpenApiDocument } from 'better-trpc-openapi';
import { appRouter } from '~/server/api/root';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'API 문서',
  description: 'OpenAPI compliant REST API built using tRPC with Next.js',
  version: '1.0.0',
  // baseUrl: 'http://localhost/api',
  baseUrl: 'https://4cuts.store/api',
  docsUrl: 'https://4cuts.store/api/openapi.json',
  tags: ['account', 's3'],
});
