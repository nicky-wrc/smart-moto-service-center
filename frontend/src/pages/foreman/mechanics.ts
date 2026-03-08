export type Mechanic = { id: number; name: string; avatar: string; jobs: number; skills: string[] }

export const mockMechanics: Mechanic[] = [
  { id: 1, name: 'สมชาย ช่างดี',    avatar: 'ส', jobs: 3, skills: ['เครื่องยนต์', 'ส่งกำลัง'] },
  { id: 2, name: 'วิชัย รักงาน',    avatar: 'ว', jobs: 2, skills: ['ไฟฟ้า', 'เบรก'] },
  { id: 3, name: 'ประยุทธ์ มือทอง', avatar: 'ป', jobs: 1, skills: ['ช่วงล่าง', 'เบรก'] },
  { id: 4, name: 'ธนากร ขยัน',     avatar: 'ธ', jobs: 0, skills: ['เครื่องยนต์', 'เชื้อเพลิง'] },
]
