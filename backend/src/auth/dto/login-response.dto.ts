import { ApiProperty } from '@nestjs/swagger';
import type { UserWithoutPassword } from '../auth.service';

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  user: UserWithoutPassword;
}
