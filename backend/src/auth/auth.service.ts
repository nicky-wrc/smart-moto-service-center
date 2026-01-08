// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

interface UserWithoutPassword {
  id: number;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ฟังก์ชันเช็ค User/Pass
  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserWithoutPassword | null> {
    // 1. หา User จาก Database (แต่เราไม่มีฟังก์ชัน findByUsername เดี๋ยวไปเติม)
    // เราจะใช้ findAll มา filter ชั่วคราวก่อน หรือคุณไปเพิ่ม findByUsername ใน users.service ก็ได้
    // แต่เพื่อความง่าย ผมขอใช้ท่าลัดนี้ก่อน:
    const users = await this.usersService.findAll();
    const user = users.find((u) => u.username === username);

    // 2. เช็ครหัสผ่าน
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user; // ตัด password ออกไม่ส่งกลับ
      return result;
    }
    return null;
  }

  // ฟังก์ชันสร้าง Token
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // ข้อมูลที่จะฝังอยู่ใน Token (Payload)
    const payload = { username: user.username, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: user, // ส่งข้อมูล User กลับไปให้ Frontend ใช้ด้วย
    };
  }
}
