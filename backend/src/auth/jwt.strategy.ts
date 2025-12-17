// backend/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // รับ Token จาก Header
      ignoreExpiration: false, // ถ้า Token หมดอายุให้ดีดออกทันที
      secretOrKey: process.env.JWT_SECRET || 'secretKey123', // ต้องตรงกับตอน sign ใน module
    });
  }

  async validate(payload: any) {
    // ข้อมูลที่จะถูกส่งไปให้ Controller ใช้ต่อ (ผ่าน req.user)
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
