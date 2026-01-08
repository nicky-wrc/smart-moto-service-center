// backend/src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; // <--- 1. Import มา

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  // 2. เปลี่ยนจาก any เป็น LoginDto
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
