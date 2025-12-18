import * as jwt from 'jsonwebtoken';

export class JwtSigner {
  private readonly secret = process.env.JWT_SECRET!;

  sign(payload: any): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: '7d',
    });
  }

  verify(token: string): any {
    return jwt.verify(token, this.secret);
  }

  getSecret(): string {
    return this.secret;
  }
}
