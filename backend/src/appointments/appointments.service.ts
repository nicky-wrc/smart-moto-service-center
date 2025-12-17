import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentConvertToJobDto } from './dto/convert-to-job.dto';
import { JobType, JobStatus, AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, userId: number) {
    const scheduledDateTime = new Date(
      `${createAppointmentDto.scheduledDate}T${createAppointmentDto.scheduledTime}:00`,
    );

    // Generate appointment number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.appointment.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
        },
      },
    });
    const runNo = (count + 1).toString().padStart(4, '0');
    const appointmentNo = `APT-${dateStr}-${runNo}`;

    return this.prisma.appointment.create({
      data: {
        appointmentNo,
        motorcycleId: createAppointmentDto.motorcycleId,
        scheduledDate: scheduledDateTime,
        scheduledTime: createAppointmentDto.scheduledTime,
        scheduledById: userId,
        status: AppointmentStatus.SCHEDULED,
        notes: createAppointmentDto.notes,
      },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        scheduledBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        scheduledBy: {
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
      orderBy: {
        scheduledDate: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        scheduledBy: {
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

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Can only update scheduled appointments');
    }

    const updateData: any = { ...updateAppointmentDto };

    if (updateAppointmentDto.scheduledDate && updateAppointmentDto.scheduledTime) {
      updateData.scheduledDate = new Date(
        `${updateAppointmentDto.scheduledDate}T${updateAppointmentDto.scheduledTime}:00`,
      );
      delete updateData.scheduledTime;
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        scheduledBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.job) {
      throw new BadRequestException('Cannot delete appointment that has been converted to job');
    }

    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async convertToJob(id: number, convertDto: AppointmentConvertToJobDto, userId: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.job) {
      throw new BadRequestException('Appointment has already been converted to job');
    }

    if (!convertDto.symptom) {
      throw new BadRequestException('Symptom is required');
    }

    // Generate job number
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

    // Create job and link to appointment
    const job = await this.prisma.job.create({
      data: {
        jobNo,
        motorcycleId: appointment.motorcycleId,
        appointmentId: id,
        receptionId: userId,
        symptom: convertDto.symptom,
        jobType: convertDto.jobType || JobType.NORMAL,
        fuelLevel: convertDto.fuelLevel,
        valuables: convertDto.valuables,
        status: JobStatus.PENDING,
      },
      include: {
        motorcycle: {
          include: {
            owner: true,
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
    });

    // Update appointment status
    await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.COMPLETED,
      },
    });

    return job;
  }

  async findAppointmentsByMotorcycle(motorcycleId: number) {
    return this.prisma.appointment.findMany({
      where: { motorcycleId },
      include: {
        scheduledBy: {
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
      orderBy: {
        scheduledDate: 'desc',
      },
    });
  }
}

