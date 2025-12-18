import * as bcrypt from 'bcryptjs';

export const hashPassword = (password: string) =>
  bcrypt.hashSync(password, 10);

export const comparePassword = (password: string, hashed: string) =>
  bcrypt.compareSync(password, hashed);
