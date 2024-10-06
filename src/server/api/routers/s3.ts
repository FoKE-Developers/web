// source: https://blog.nickramkissoon.com/posts/t3-s3-presigned-urls
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { env } from '~/env.js';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
export const s3Router = createTRPCRouter({
  /**
   * It will be used to create a presigned URL that can be used to upload a file with a specific key to our S3 bucket.
   * This will be used for regular uploads, where the entire file is uploaded in a single request.
   */
  getStandardUploadPresignedUrl: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/s3/presigned-url',
        tags: ['s3'],
        protect: true,
        description: `
          url을 반환함. 반환된 url에 put 요청으로 업로드 할 수 있음.
          axios.put(url, f.slice(), { headers: { "Content-Type": f.type } })
          성공시 https://kr.object.ncloudstorage.com/4cuts/\${session.user.id}/\${key} 를 통해서 파일에 접근 가능
          session.user.name은 회원가입시 입력한 값임. GET /account/who-am-i 를 통해서 획득 가능함.
        `,
      },
    })
    .input(
      z.object({
        key: z
          .string()
          .describe(`\${session.user.name}/\${key}를 기준으로 스토리지에 저장`),
        ContentLength: z.number().max(1024 * 1024 * 20).describe(`
            Byte단위. 
            20MB인경우 1024 * 1024 * 20. 
            20MB 제한있음.
          `),
      })
    )
    .output(
      z.object({
        presignedUrl: z.string().describe(`
        업로드할 주소. 아래 코드를 참고해서 업로드 부탁.
        axios.put(presignedUrl, f.slice(), { headers: { "Content-Type": f.type } })
      `),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { key, ContentLength } = input;
      const { s3 } = ctx;

      // 20 MB limit
      if (ContentLength > 1024 * 1024 * 20) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File too large. (20MB Limit)',
        });
      }
      const putObjectCommand = new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: `${ctx.session.user.name}/${key}`,
        ContentLength, // 10 MB
      });

      return {
        presignedUrl: await getSignedUrl(s3, putObjectCommand),
      };
    }),
});
