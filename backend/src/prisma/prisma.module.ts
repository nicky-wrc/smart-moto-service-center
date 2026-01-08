import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <--- แนะนำให้ใส่บรรทัดนี้ เพื่อให้เรียกใช้ได้ทั้งโปรเจกต์โดยไม่ต้อง Import บ่อยๆ
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <--- สำคัญมาก! ต้องส่งออกให้คนอื่นใช้
})
export class PrismaModule {}
