import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceCatalogService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        name: string;
        laborCost: number;
        category?: string;
        tags?: string[];
    }) {
        return this.prisma.serviceCatalog.create({
            data: {
                name: data.name,
                laborCost: data.laborCost,
                category: data.category,
                tags: data.tags || [],
            },
        });
    }

    async findAll(filters?: {
        search?: string;
        category?: string;
        tag?: string;
        isActive?: boolean;
    }) {
        const where: any = {};

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters?.category) {
            where.category = filters.category;
        }

        if (filters?.tag) {
            where.tags = { has: filters.tag };
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { category: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.serviceCatalog.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: number) {
        const item = await this.prisma.serviceCatalog.findUnique({ where: { id } });
        if (!item) throw new NotFoundException(`Service Catalog item ${id} not found`);
        return item;
    }

    async update(
        id: number,
        data: {
            name?: string;
            laborCost?: number;
            category?: string;
            tags?: string[];
            isActive?: boolean;
        },
    ) {
        await this.findOne(id);
        return this.prisma.serviceCatalog.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.serviceCatalog.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async getTags() {
        const items = await this.prisma.serviceCatalog.findMany({
            where: { isActive: true },
            select: { tags: true },
        });
        const allTags = items.flatMap((i) => i.tags);
        return [...new Set(allTags)].sort();
    }
}
