import { S3 } from '@aws-sdk/client-s3';
import { env } from '~/env.js';

export const s3 = new S3({
  region: env.REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  endpoint: 'https://kr.object.ncloudstorage.com',
});
