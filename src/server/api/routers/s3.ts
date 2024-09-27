// source: https://blog.nickramkissoon.com/posts/t3-s3-presigned-urls
import { PutObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { env } from '~/env.js';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc';
export const s3Router = createTRPCRouter({
  getObjects: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/s3/objects', tags: ['s3'] } })
    .input(z.void())
    .output(z.any())
    .query(({ ctx }) => {
      return ctx.s3.listObjectsV2({
        Bucket: env.BUCKET_NAME,
      });
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
      },
    })
    .input(z.object({ key: z.string(), ContentLength: z.number() }))
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      const { key, ContentLength } = input;
      const { s3 } = ctx;

      // 20 MB limit
      if (ContentLength > 1024 * 1024 * 20) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File too large',
        });
      }
      const putObjectCommand = new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: `${ctx.session.user.id}/${key}`,
        ContentLength, // 10 MB
      });

      return await getSignedUrl(s3, putObjectCommand);
    }),

  /**
   * This will be used to upload a file in multiple parts, so we need a presigned URL for each part.
   * Before creating the URLS, the multipart upload needs to be initialized, so we will be doing that as well.
   */
  getMultipartUploadPresignedUrl: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/s3/multipart-presignedUrl',
        tags: ['s3'],
        protect: true,
      },
    })
    .input(z.object({ key: z.string(), filePartTotal: z.number() }))
    .output(
      z.object({
        uploadId: z.string(),
        urls: z.array(
          z.object({
            url: z.string(),
            partNumber: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { key, filePartTotal } = input;
      const { s3 } = ctx;

      const uploadId = (
        await s3.createMultipartUpload({
          Bucket: env.BUCKET_NAME,
          Key: key,
        })
      ).UploadId;

      if (!uploadId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not create multipart upload',
        });
      }

      const urls: Promise<{ url: string; partNumber: number }>[] = [];

      for (let i = 1; i <= filePartTotal; i++) {
        const uploadPartCommand = new UploadPartCommand({
          Bucket: env.BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          PartNumber: i,
        });

        const url = getSignedUrl(s3, uploadPartCommand).then((url) => ({
          url,
          partNumber: i,
        }));

        urls.push(url);
      }

      return {
        uploadId,
        urls: await Promise.all(urls),
      };
    }),

  completedMultipartUpload: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        uploadId: z.string(),
        parts: z.array(
          z.object({
            ETag: z.string(),
            PartNumber: z.number(),
          })
        ),
      })
    )
    .output(
      z.any()
      // // which is zod version of CompleteMultipartUploadCommandOutput
      // z.object({
      //   Bucket: z.string().optional(),
      //   ETag: z.string().optional(),
      // })
    )
    .mutation(async ({ ctx, input }) => {
      const { key, uploadId, parts } = input;
      const { s3 } = ctx;

      const completeMultipartUploadOutput = await s3.completeMultipartUpload({
        Bucket: env.BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      });

      completeMultipartUploadOutput.ETag;

      return completeMultipartUploadOutput;
    }),
});
