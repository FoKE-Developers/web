// source: https://blog.nickramkissoon.com/posts/t3-s3-presigned-urls
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { env } from '~/env.js';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc';
export const s3Router = createTRPCRouter({
  listUserFiles: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/s3/list-files',
        tags: ['s3'],
        protect: true,
        description: 'Returns list of files uploaded by the current user',
      },
    })
    .input(z.object({ userId: z.string() }))
    .output(
      z.object({
        files: z.array(
          z.object({
            key: z.string().optional(),
            size: z.number().optional(),
            lastModified: z.date().optional(),
            url: z.string(),
            downloadUrl: z.string(),
          })
        ),
      })
    )
    .query(async ({ ctx, input: { userId } }) => {
      const response = await ctx.s3.listObjectsV2({
        Bucket: env.BUCKET_NAME,
        Prefix: `${userId}/`, // Only list objects that are in the user's folder
      });

      return {
        files:
          response.Contents?.map((object) => ({
            key: object.Key,
            size: object.Size,
            lastModified: object.LastModified,
            url: `https://kr.object.ncloudstorage.com/${env.BUCKET_NAME}/${object.Key}`,
            downloadUrl: `//download/${object.Key}`,
          })) ?? [],
      };
    }),
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
          성공시 https://kr.object.ncloudstorage.com/4cuts/\${session.user.id}/\${filename} 를 통해서 파일에 접근 가능
          session.user.name은 회원가입시 입력한 값임. GET /account/who-am-i 를 통해서 획득 가능함.
        `,
      },
    })
    .input(
      z.object({
        filename: z
          .string()
          .describe(
            `\${session.user.name}/\${filename}를 기준으로 스토리지에 저장. abc.png 이런식`
          ),
        ContentLength: z
          .number()
          .max(1024 * 1024 * 20, 'File too large. (20MB Limit)').describe(`
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
      const { filename, ContentLength } = input;
      const { s3 } = ctx;

      const putObjectCommand = new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: `${ctx.session.user.name}/${filename}`,
        ContentLength,
        ACL: 'public-read',
      });

      return {
        presignedUrl: await getSignedUrl(s3, putObjectCommand),
      };
    }),
});
