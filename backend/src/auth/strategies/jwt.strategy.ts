import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtSigner } from '../../common/utils/jwt-signer';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtSigner: JwtSigner) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSigner.getSecret(),
    });
  }

  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException('Token inválido');
    return payload; // llega a req.user
  }
}
