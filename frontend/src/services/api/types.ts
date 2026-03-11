export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface Customer {
  id: number;
  phoneNumber: string;
  title?: string;
  firstName: string;
  lastName: string;
  address?: string;
  taxId?: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  phoneNumber: string;
  title?: string;
  firstName: string;
  lastName: string;
  address?: string;
  taxId?: string;
}

export interface Motorcycle {
  id: number;
  vin: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  year?: number;
  engineNo?: string;
  ownerId: number;
  mileage?: number;
  owner: {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export interface CreateMotorcycleDto {
  vin: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  year?: number;
  engineNo?: string;
  ownerId: number;
}

export type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED' | 'PAID' | 'CANCELLED';
export type JobType = 'NORMAL' | 'FAST_TRACK';

export interface Job {
  id: number;
  jobNo: string;
  symptom: string;
  fuelLevel?: number;
  valuables?: string;
  diagnosisNotes?: string;
  status: JobStatus;
  jobType: JobType;
  motorcycleId: number;
  receptionId?: number;
  technicianId?: number;
  startedAt?: string;
  createdAt: string;
  updatedAt: string;
  motorcycle: {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    mileage?: number;
    owner: {
      id: number;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    };
  };
  reception?: {
    id: number;
    name: string;
  };
  technician?: {
    id: number;
    name: string;
  };
}

export interface CreateJobDto {
  motorcycleId: number;
  symptom: string;
  jobType: JobType;
  fuelLevel?: number;
  valuables?: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: number;
  appointmentNo: string;
  motorcycleId: number;
  scheduledDate: string;
  scheduledTime: string;
  status: AppointmentStatus;
  notes?: string;
  scheduledById: number;
  jobId?: number;
  createdAt: string;
  updatedAt: string;
  motorcycle: {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    owner: {
      id: number;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    };
  };
  scheduledBy: {
    id: number;
    name: string;
  };
  job?: {
    id: number;
    jobNo: string;
  };
}

export interface CreateAppointmentDto {
  motorcycleId: number;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
}

export interface ConvertToJobDto {
  symptom: string;
  jobType?: 'NORMAL' | 'FAST_TRACK';
  fuelLevel?: number;
  valuables?: string;
}

export interface Part {
  id: number;
  partNo: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  unit: string;
  unitPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartDto {
  partNo: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  unit?: string;
  unitPrice: number;
  stockQuantity?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface UpdatePartDto {
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  unit?: string;
  unitPrice?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  isActive?: boolean;
}

export interface PartPackage {
  id: number;
  packageNo: string;
  name: string;
  description?: string;
  sellingPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    partId: number;
    quantity: number;
    part: {
      id: number;
      partNo: string;
      name: string;
      unit: string;
      unitPrice: number;
    };
  }>;
}

export interface JobChecklistItem {
  id: number;
  jobId: number;
  itemName: string;
  condition: string;
  notes?: string;
  createdAt: string;
}

export interface CreateChecklistItemDto {
  itemName: string;
  condition: string;
  notes?: string;
}

export type PartRequisitionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED';

export interface PartRequisition {
  id: number;
  reqNo: string;
  jobId?: number;
  requestedById: number;
  status: PartRequisitionStatus;
  notes?: string;
  approvedAt?: string;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: number;
    jobNo: string;
    motorcycle: {
      id: number;
      licensePlate: string;
      brand: string;
      model: string;
      owner: {
        id: number;
        firstName: string;
        lastName: string;
        phoneNumber: string;
      };
    };
  };
  requestedBy: {
    id: number;
    name: string;
    role: string;
  };
  items: Array<{
    id: number;
    partId?: number;
    packageId?: number;
    quantity: number;
    requestedQuantity: number;
    issuedQuantity: number;
    notes?: string;
    part?: {
      id: number;
      partNo: string;
      name: string;
      stockQuantity: number;
      unit: string;
    };
    package?: {
      id: number;
      packageNo: string;
      name: string;
    };
  }>;
}

export interface CreateRequisitionDto {
  jobId?: number;
  items: Array<{
    partId?: number;
    packageId?: number;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
}

export interface ApproveRequisitionDto {
  notes?: string;
}

export interface RejectRequisitionDto {
  reason: string;
}

export interface IssueRequisitionDto {
  items: Array<{
    itemId: number;
    issuedQuantity: number;
    notes?: string;
  }>;
  notes?: string;
}

export interface LostSale {
  id: number;
  partId: number;
  part: Part;
  requestedQuantity: number;
  customerId?: number;
  customer?: Customer;
  jobId?: number;
  job?: Job;
  notes?: string;
  createdAt: string;
}

export interface CreateLostSaleDto {
  partId: number;
  requestedQuantity: number;
  customerId?: number;
  jobId?: number;
  notes?: string;
}

export interface Outsource {
  id: number;
  jobId: number;
  job: Job;
  vendorName: string;
  description: string;
  cost: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutsourceDto {
  jobId: number;
  vendorName: string;
  description: string;
  cost: number;
}

export interface UpdateOutsourceDto {
  vendorName?: string;
  description?: string;
  cost?: number;
  status?: string;
}

export interface LaborTime {
  id: number;
  jobId: number;
  technicianId: number;
  technician: User;
  laborTypeId?: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  cost?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLaborTimeDto {
  jobId: number;
  technicianId: number;
  laborTypeId?: number;
}

export interface Payment {
  id: number;
  paymentNo: string;
  jobId: number;
  job: Job;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  jobId: number;
  job: Job;
  subtotal: number;
  tax?: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface Quotation {
  id: number;
  quotationNo: string;
  customerId: number;
  customer: Customer;
  motorcycleId: number;
  motorcycle: Motorcycle;
  status: string;
  totalAmount: number;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export interface CreateQuotationDto {
  customerId: number;
  motorcycleId: number;
  validUntil?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

export interface UpdateQuotationDto {
  validUntil?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

export interface ServiceReminder {
  id: number;
  customerId: number;
  motorcycleId: number;
  motorcycle: Motorcycle;
  reminderType: string;
  reminderDate: string;
  mileage: number;
  isNotified: boolean;
  notifiedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateServiceReminderDto {
  customerId: number;
  motorcycleId: number;
  reminderType: string;
  reminderDate: string;
  mileage: number;
  notes?: string;
}

export interface PointTransaction {
  id: number;
  customerId: number;
  type: string;
  points: number;
  amount?: number;
  description?: string;
  reference?: string;
  createdAt: string;
}

export interface EarnPointsDto {
  customerId: number;
  points: number;
  amount: number;
  description?: string;
  reference?: string;
}

export interface UsePointsDto {
  customerId: number;
  points: number;
  amount: number;
  description?: string;
  reference?: string;
}

export interface Warranty {
  id: number;
  jobId: number;
  job: Job;
  partId?: number;
  part?: Part;
  warrantyType: string;
  warrantyPeriod: number;
  warrantyPeriodUnit: string;
  startDate: string;
  endDate: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface ServiceHistory {
  jobId: number;
  jobNo: string;
  date: string;
  symptom: string;
  totalCost: number;
  technician?: string;
  parts: Array<{
    partNo: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}
