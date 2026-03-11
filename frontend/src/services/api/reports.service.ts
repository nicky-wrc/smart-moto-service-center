import { apiClient } from './client';

export interface SalesSummary {
  totalSales: number;
  todaySales: number;
  monthlySales: number;
  transactionCount: number;
}

export interface TopPart {
  partId: number;
  partNo: string;
  partName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface TechnicianPerformance {
  technicianId: number;
  technicianName: string;
  totalJobs: number;
  totalCost: number;
  totalHours: number;
  averageTimePerJob: number;
  efficiency: number;
  averageCostPerJob: number;
}

export interface TechnicianIdleTime {
  technicianId: number;
  technicianName: string;
  idleTime: number;
  workingTime: number;
  utilizationRate: number;
}

class ReportsService {
  async getSalesSummary(filters?: { dateFrom?: string; dateTo?: string }) {
    const params: any = {};
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return apiClient.get<SalesSummary>('/reports/dashboard/sales-summary', {
      params,
    });
  }

  async getTopParts(filters?: {
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params: any = {};
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return apiClient.get<TopPart[]>('/reports/dashboard/top-parts', {
      params,
    });
  }

  async getTechnicianPerformance(filters?: {
    dateFrom?: string;
    dateTo?: string;
    technicianId?: number;
  }) {
    const params: any = {};
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    if (filters?.technicianId) params.technicianId = filters.technicianId;

    return apiClient.get<TechnicianPerformance[]>(
      '/reports/dashboard/technician-performance',
      { params },
    );
  }

  async getTechnicianIdleTime(filters?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params: any = {};
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return apiClient.get<TechnicianIdleTime[]>(
      '/reports/dashboard/technician-idle-time',
      { params },
    );
  }
}

export const reportsService = new ReportsService();
