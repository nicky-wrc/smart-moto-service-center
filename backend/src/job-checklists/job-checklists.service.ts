import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobChecklistsService {
  constructor(private prisma: PrismaService) {}

  async createChecklistItems(
    jobId: number,
    items: Array<{ itemName: string; condition: string; notes?: string }>,
  ) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return this.prisma.jobChecklistItem.createManyAndReturn({
      data: items.map((item) => ({
        jobId,
        itemName: item.itemName,
        condition: item.condition,
        notes: item.notes || null,
      })),
    });
  }

  async createChecklistItem(
    jobId: number,
    itemName: string,
    condition: string,
    notes?: string,
  ) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return this.prisma.jobChecklistItem.create({
      data: {
        jobId,
        itemName,
        condition,
        notes: notes || null,
      },
    });
  }

  async findByJob(jobId: number) {
    return this.prisma.jobChecklistItem.findMany({
      where: { jobId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async update(
    id: number,
    data: { itemName?: string; condition?: string; notes?: string },
  ) {
    const item = await this.prisma.jobChecklistItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`JobChecklistItem with ID ${id} not found`);
    }

    return this.prisma.jobChecklistItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const item = await this.prisma.jobChecklistItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`JobChecklistItem with ID ${id} not found`);
    }

    return this.prisma.jobChecklistItem.delete({
      where: { id },
    });
  }

  async removeByJob(jobId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return this.prisma.jobChecklistItem.deleteMany({
      where: { jobId },
    });
  }
}
