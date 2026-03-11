export type Mechanic = { id: number; name: string; avatar: string; jobs: number; skills: string[] }

export const mockMechanics: Mechanic[] = [
  { id: 1,  name: 'สมชาย ช่างดี',       avatar: 'ส', jobs: 2, skills: ['เครื่องยนต์', 'ส่งกำลัง'] },
  { id: 2,  name: 'วิชัย รักงาน',       avatar: 'ว', jobs: 1, skills: ['ไฟฟ้า', 'เบรก'] },
  { id: 3,  name: 'ประยุทธ์ มือทอง',    avatar: 'ป', jobs: 1, skills: ['ช่วงล่าง', 'เบรก'] },
  { id: 4,  name: 'ธนากร ขยัน',        avatar: 'ธ', jobs: 0, skills: ['เครื่องยนต์', 'เชื้อเพลิง'] },
  { id: 5,  name: 'กิตติพงษ์ ใจเย็น',  avatar: 'ก', jobs: 2, skills: ['เบรก', 'ช่วงล่าง'] },
  { id: 6,  name: 'ณัฐพล เก่งมาก',     avatar: 'ณ', jobs: 2, skills: ['ไฟฟ้า', 'เครื่องยนต์'] },
  { id: 7,  name: 'พีระพงษ์ ทำดี',     avatar: 'พ', jobs: 0, skills: ['ส่งกำลัง', 'เชื้อเพลิง'] },
  { id: 8,  name: 'อภิสิทธิ์ ซ่อมเก่ง', avatar: 'อ', jobs: 1, skills: ['เครื่องยนต์', 'เบรก', 'ช่วงล่าง'] },
  { id: 9,  name: 'สุรชัย มีฝีมือ',     avatar: 'ส', jobs: 1, skills: ['ไฟฟ้า', 'ระบบเชื้อเพลิง'] },
  { id: 10, name: 'เอกชัย ขยันดี',     avatar: 'เ', jobs: 2, skills: ['เบรก', 'ส่งกำลัง'] },
]
