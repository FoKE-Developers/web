import { z } from 'zod';

export type ZUser = z.infer<typeof ZUser>;
export const ZUser = z.object({
  image: z.string().url('프로필 이미지를 url 형태로 입력해주세요').nullable(),
  email: z
    .string()
    .min(1, '1글자 이상 입력해주세요')
    .max(32, '32자 이하로 입력해주세요')
    .email('이메일 형식으로 입력해주세요'),
  emailVerified: z.date().nullable(),
  name: z
    .string()
    .min(1, '1글자 이상 입력해주세요')
    .max(32, '32자 이하로 입력해주세요'),
  password: z
    .string()
    .min(1, '1글자 이상 입력해주세요')
    .max(32, '32자 이하로 입력해주세요'),
});

export type ZUserScheme = z.infer<typeof ZUserScheme>;
export const ZUserScheme = ZUser.extend({
  id: z.string(),
});

export type ZRegisterUser = z.infer<typeof ZRegisterUser>;
export const ZRegisterUser = ZUser.pick({
  email: true,
  name: true,
  password: true,
});
