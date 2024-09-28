import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { env } from '~/env';

interface User {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  user: User;
}

export async function getBearerTokenSession({
  req,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];

    const decodedToken = jwt.verify(token!, env.JWT_SECRET) as unknown as User;

    // 토큰이 유효하면 세션 객체를 반환
    return {
      user: {
        name: decodedToken.name,
        email: decodedToken.email,
        id: decodedToken.id,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
