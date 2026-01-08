// backend/src/auth/dto/login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // <--- ตัวนี้แหละที่ทำให้ Swagger เห็น

export class LoginDto {
  @ApiProperty() // บอก Swagger ว่ามีช่องนี้
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty() // บอก Swagger ว่ามีช่องนี้
  @IsString()
  @IsNotEmpty()
  password: string;
}
