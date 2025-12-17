import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus } from '@prisma/client';

@Injectable()
export class LaborTimesService {
  constructor(private prisma: PrismaService) {}

  async startLaborTime(
    jobId: number,
    technicianId: number,
    taskDescription: string,
    hourlyRate: number,
    standardMinutes?: number,
  ) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.status !== JobStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot start labor time for job with status ${job.status}`);
    }

    return this.prisma.laborTime.create({
      data: {
        jobId,
        technicianId,
        taskDescription,
        hourlyRate,
        standardMinutes: standardMinutes || null,
        actualMinutes: 0,
        laborCost: 0,
        startedAt: new Date(),
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        job: {
          select: {
            id: true,
            jobNo: true,
          },
        },
      },
    });
  }

  async pauseLaborTime(id: number) {
    const laborTime = await this.prisma.laborTime.findUnique({
      where: { id },
    });

    if (!laborTime) {
      throw new NotFoundException(`LaborTime with ID ${id} not found`);
    }

    if (!laborTime.startedAt || laborTime.finishedAt) {
      throw new BadRequestException('Labor time is not active');
    }

    const now = new Date();
    const startTime = laborTime.startedAt;
    const resumeTime = laborTime.resumedAt || startTime;
    const elapsedMinutes = Math.floor((now.getTime() - resumeTime.getTime()) / (1000 * 60));
    const totalMinutes = laborTime.actualMinutes + elapsedMinutes;

    const laborCost = (totalMinutes / 60) * Number(laborTime.hourlyRate);

    return this.prisma.laborTime.update({
      where: { id },
      data: {
        actualMinutes: totalMinutes,
        laborCost,
        pausedAt: now,
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async resumeLaborTime(id: number) {
    const laborTime = await this.prisma.laborTime.findUnique({
      where: { id },
    });

    if (!laborTime) {
      throw new NotFoundException(`LaborTime with ID ${id} not found`);
    }

    if (!laborTime.pausedAt) {
      throw new BadRequestException('Labor time is not paused');
    }

    return this.prisma.laborTime.update({
      where: { id },
      data: {
        resumedAt: new Date(),
        pausedAt: null,
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async finishLaborTime(id: number) {
    const laborTime = await this.prisma.laborTime.findUnique({
      where: { id },
    });

    if (!laborTime) {
      throw new NotFoundException(`LaborTime with ID ${id} not found`);
    }

    if (laborTime.finishedAt) {
      throw new BadRequestException('Labor time already finished');
    }

    const now = new Date();
    const startTime = laborTime.startedAt;
    if (!startTime) {
      throw new BadRequestException('Labor time has not started');
    }
    const resumeTime = laborTime.resumedAt || startTime;
    const elapsedMinutes = Math.floor((now.getTime() - resumeTime.getTime()) / (1000 * 60));
    const totalMinutes = laborTime.actualMinutes + elapsedMinutes;

    const laborCost = (totalMinutes / 60) * Number(laborTime.hourlyRate);

    return this.prisma.laborTime.update({
      where: { id },
      data: {
        actualMinutes: totalMinutes,
        laborCost,
        finishedAt: now,
        pausedAt: null,
        resumedAt: null,
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        job: {
          select: {
            id: true,
            jobNo: true,
          },
        },
      },
    });
  }

  async findByJob(jobId: number) {
    return this.prisma.laborTime.findMany({
      where: { jobId },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const laborTime = await this.prisma.laborTime.findUnique({
      where: { id },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        job: {
          include: {
            motorcycle: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!laborTime) {
      throw new NotFoundException(`LaborTime with ID ${id} not found`);
    }

    return laborTime;
  }

  async getTotalLaborCost(jobId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const laborTimes = await this.prisma.laborTime.findMany({
      where: { jobId },
    });

    const now = new Date();
    let totalCost = 0;
    let totalMinutes = 0;
    const standardMinutes = laborTimes.reduce((sum, lt) => sum + (lt.standardMinutes || 0), 0);

    for (const lt of laborTimes) {
      let minutes = lt.actualMinutes;

      if (!lt.finishedAt && lt.startedAt) {
        const startTime = lt.startedAt;
        const resumeTime = lt.resumedAt || startTime;
        const endTime = lt.pausedAt || now;
        const elapsedMinutes = Math.floor((endTime.getTime() - resumeTime.getTime()) / (1000 * 60));
        minutes = lt.actualMinutes + elapsedMinutes;
      }

      const cost = (minutes / 60) * Number(lt.hourlyRate);
      totalCost += cost;
      totalMinutes += minutes;
    }

    return {
      totalCost,
      totalMinutes,
      standardMinutes,
      laborTimes: laborTimes.length,
      efficiency: standardMinutes > 0 && totalMinutes > 0 ? (standardMinutes / totalMinutes) * 100 : null,
    };
  }
}

