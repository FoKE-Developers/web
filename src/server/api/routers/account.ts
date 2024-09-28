import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '~/env';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { ZRegisterUser, ZUserScheme } from '~/types/user';
import { hashPassword, verifyPassword } from '~/utils/crypto';

export const accountRouter = createTRPCRouter({
  register: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/account/register',
        tags: ['account'],
        protect: false,
      },
    })
    .input(ZRegisterUser)
    .output(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const { email, name, password } = input;
      const hashedPassword = await hashPassword(password);
      const foundUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (foundUser) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '이미 사용중인 email 입니다.',
        });
      }
      const user = (
        await db
          .insert(users)
          .values({
            email,
            name,
            password: hashedPassword,
          })
          .returning({
            email: users.email,
            name: users.name,
            id: users.id,
          })
      )[0]!;

      const token = sign(
        {
          id: user.id,
          email: user.email,
        },
        env.JWT_SECRET,
        { expiresIn: '600 days' }
      );

      return { token };
    }),
  signIn: publicProcedure
    .meta({
      openapi: { method: 'GET', path: '/account/signin', tags: ['account'] },
    })
    .input(ZUserScheme.pick({ email: true, password: true }))
    .output(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const queriedUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!queriedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '유저 정보를 찾을수 없습니다',
        });
      }

      const isValid = await verifyPassword({
        hashedPassword: queriedUser.password,
        password,
      });

      if (!isValid) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'wrong password',
        });
      }

      const token = sign(
        {
          id: queriedUser.id,
          email: queriedUser.email,
        },
        env.JWT_SECRET,
        { expiresIn: '600 days' }
      );

      return { token };
    }),
  getCurrentUser: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/account/current-user',
        tags: ['account'],
        protect: true,
      },
    })
    .input(z.void())
    .output(ZUserScheme.pick({ name: true, email: true, id: true }))
    .query(async ({ ctx }) => {
      const currentUser = ctx.session.user;

      const userFromDB = await ctx.db.query.users.findFirst({
        where: eq(users.id, currentUser.id),
        columns: {
          id: true,
          name: true,
          email: true,
          password: false,
        },
      });

      if (!userFromDB) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '유저 정보를 찾을수 없습니다',
        });
      }

      return userFromDB;
    }),
});