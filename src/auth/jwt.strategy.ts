import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // Ensure this matches your secret
    });
  }

  validate(payload: any) {
    console.log('JWT Payload in Strategy:', payload); // Debugging line
    return {
      userId: payload.sub,
      branchId: payload.branchId, // Attach branchId to req.user
      username: payload.username,
    };
  }
}
