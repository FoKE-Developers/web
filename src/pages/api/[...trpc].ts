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
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({ path, error }: any) => {
            console.error(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  })(req, res);
};

export default handler;
