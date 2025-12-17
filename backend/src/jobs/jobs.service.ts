import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, JobType } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, userId: number) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.job.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
        },
      },
    });
    const runNo = (count + 1).toString().padStart(4, '0');
    const jobNo = `JOB-${dateStr}-${runNo}`;

    return this.prisma.job.create({
      data: {
        ...createJobDto,
        jobNo: jobNo,
        receptionId: userId,
        status: JobStatus.PENDING,
      },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    status?: JobStatus;
    jobType?: JobType;
    technicianId?: number;
    motorcycleId?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.jobType) {
      where.jobType = filters.jobType;
    }

    if (filters?.technicianId) {
      where.technicianId = filters.technicianId;
    }

    if (filters?.motorcycleId) {
      where.motorcycleId = filters.motorcycleId;
    }

    return this.prisma.job.findMany({
      where,
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentNo: true,
            scheduledDate: true,
          },
        },
      },
      orderBy: [
        { jobType: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  findOne(id: number) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: true,
        laborTimes: {
          include: {
            technician: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        checklistItems: true,
        outsources: true,
        payment: true,
      },
    });
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return this.prisma.job.update({
      where: { id },
      data: updateJobDto,
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        technician: true,
      },
    });
  }

  async assignTechnician(jobId: number, technicianId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.PAID || job.status === JobStatus.CANCELLED) {
      throw new BadRequestException(`Cannot assign technician to job with status ${job.status}`);
    }

    const technician = await this.prisma.user.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new BadRequestException(`User with ID ${technicianId} not found`);
    }

    if (technician.role !== 'TECHNICIAN' && technician.role !== 'FOREMAN') {
      throw new BadRequestException(
        `User ID ${technicianId} has role '${technician.role}'. Only TECHNICIAN or FOREMAN can be assigned to jobs.`,
      );
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        technicianId,
        ...(job.status === JobStatus.PENDING ? { status: JobStatus.IN_PROGRESS, startedAt: new Date() } : {}),
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async startJob(jobId: number, technicianId?: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.status === JobStatus.IN_PROGRESS) {
      if (technicianId && job.technicianId !== technicianId) {
        return this.prisma.job.update({
          where: { id: jobId },
          data: {
            technicianId,
          },
          include: {
            technician: {
              select: {
                id: true,
                name: true,
              },
            },
            motorcycle: {
              include: {
                owner: true,
              },
            },
            reception: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }
      return this.prisma.job.findUnique({
        where: { id: jobId },
        include: {
          technician: {
            select: {
              id: true,
              name: true,
            },
          },
          motorcycle: {
            include: {
              owner: true,
            },
          },
          reception: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    if (job.status !== JobStatus.PENDING && job.status !== JobStatus.WAITING_PARTS) {
      throw new BadRequestException(
        `Cannot start job with status ${job.status}. Job must be PENDING or WAITING_PARTS to start.`,
      );
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.IN_PROGRESS,
        startedAt: new Date(),
        ...(technicianId ? { technicianId } : {}),
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async completeJob(jobId: number, diagnosisNotes?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.status !== JobStatus.IN_PROGRESS && job.status !== JobStatus.WAITING_PARTS) {
      throw new BadRequestException(`Cannot complete job with status ${job.status}`);
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        ...(diagnosisNotes ? { diagnosisNotes } : {}),
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async cancelJob(jobId: number, reason?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.status === JobStatus.PAID || job.status === JobStatus.CANCELLED) {
      throw new BadRequestException(`Cannot cancel job with status ${job.status}`);
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.CANCELLED,
        diagnosisNotes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
      },
    });
  }

  async getJobQueue(technicianId?: number) {
    const where: any = {
      status: {
        in: [JobStatus.PENDING, JobStatus.IN_PROGRESS, JobStatus.WAITING_PARTS],
      },
    };

    if (technicianId) {
      where.technicianId = technicianId;
    }

    return this.prisma.job.findMany({
      where,
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            appointmentNo: true,
            scheduledDate: true,
          },
        },
      },
      orderBy: [
        { jobType: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  remove(id: number) {
    return this.prisma.job.delete({
      where: { id },
      include: {
        motorcycle: true,
      },
    });
  }
}
