import type {
  NextApiRequest,
  NextApiResponse,
} from '@trpc/server/adapters/next';
import { createOpenApiNextHandler } from 'better-trpc-openapi';
import cors from 'nextjs-cors';
import { env } from '~/env';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Setup CORS
  await cors(req, res);

  // Handle incoming OpenAPI requests
  return createOpenApiNextHandler({
    router: appRouter,
    createContext: createTRPCContext,
    responseMeta: undefined,
    onError:
      env.NODE_ENV === 'development'
        ? // @ts-ignore
          ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  })(req, res);
};

export default handler;
