import { compare, hash } from 'bcrypt';

export async function hashPassword(password: string) {
  const hashedPassword = await hash(password, 12);

  return hashedPassword;
}

export async function verifyPassword({
  password,
  hashedPassword,
}: {
  password: string;
  hashedPassword: string;
}) {
  const isValid = await compare(password, hashedPassword);
  return isValid;
}
