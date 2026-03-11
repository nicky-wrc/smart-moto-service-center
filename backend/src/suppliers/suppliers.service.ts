import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        name: string;
        contactName?: string;
        phoneNumber?: string;
        email?: string;
        address?: string;
        taxId?: string;
    }) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.supplier.count({
            where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        });
        const supplierNo = `SUP-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

        return this.prisma.supplier.create({
            data: {
                supplierNo,
                ...data,
            },
        });
    }

    async findAll(filters?: { search?: string; isActive?: boolean }) {
        const where: any = {};

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { supplierNo: { contains: filters.search, mode: 'insensitive' } },
                { contactName: { contains: filters.search, mode: 'insensitive' } },
                { phoneNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.supplier.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: { purchaseOrders: { orderBy: { createdAt: 'desc' }, take: 10 } },
        });
        if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
        return supplier;
    }

    async update(
        id: number,
        data: {
            name?: string;
            contactName?: string;
            phoneNumber?: string;
            email?: string;
            address?: string;
            taxId?: string;
            isActive?: boolean;
        },
    ) {
        await this.findOne(id);
        return this.prisma.supplier.update({ where: { id }, data });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.supplier.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
