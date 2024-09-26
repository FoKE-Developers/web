import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .meta({ openapi: { method: "GET", path: '/hello', summary: "get hello", tags: ['post'], description: '인자로 받은 text를 Hello 뒤에 붙여서 보내줍니다.' } })
    .input(z.object({ text: z.string() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      console.log({ input })
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/hello', summary: 'create hello', tags: ['post'], description: 'post를 생성합니다.', protect: true }})
    .input(z.object({ name: z.string().min(1) }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
