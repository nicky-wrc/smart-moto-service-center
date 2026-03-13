/**
 * Types for Foreman Response System
 * Used by Reception to receive and display foreman's assessment
 */

export interface ForemanResponse {
    id: string
    jobId: string // Link to the original job
    queueNumber: string
    
    // Customer Info
    customerId: string
    firstName: string
    lastName: string
    phone: string
    address?: string
    
    // Motorcycle Info
    motorcycleId: string
    model: string
    color: string
    plateLine1: string
    plateLine2: string
    province: string
    
    // Original Symptoms (from customer)
    symptoms: string
    tags: string[]
    images?: string[]
    
    // Foreman's Assessment
    foremanAnalysis: string
    estimatedCost: number
    estimatedDuration: string
    requiredParts: RequiredPart[]
    additionalNotes?: string
    
    // Foreman Info
    respondedAt: string // ISO DateTime
    respondedBy: string
    foremanId: string
    assessmentNumber: number // ครั้งที่ประเมิน
    
    // Customer Decision
    customerDecision?: CustomerDecision
    customerDecisionAt?: string // ISO DateTime
    decisionBy?: string // Reception staff who recorded the decision
    
    // Status
    status: ForemanResponseStatus
    
    // Timestamps
    createdAt: string
    updatedAt: string

    // Computed from job list (items count when full items not loaded)
    _itemsCount?: number
}

export interface RequiredPart {
    partId?: string // If exists in inventory
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
    partNumber?: string
    supplier?: string
    inStock?: boolean
}

export type CustomerDecision = 'approved' | 'rejected' | null

export type ForemanResponseStatus = 
    | 'PENDING_CUSTOMER' // รอการตัดสินใจจากลูกค้า
    | 'APPROVED' // ลูกค้าอนุมัติ - เริ่มซ่อม
    | 'REJECTED' // ลูกค้าไม่อนุมัติ - ยกเลิก
    | 'IN_PROGRESS' // กำลังซ่อม
    | 'COMPLETED' // ซ่อมเสร็จ

export interface CustomerDecisionRequest {
    decision: 'approved' | 'rejected' | 'approved_waiting_parts'
    notes?: string
    decisionBy: string
    decisionByUserId?: number
}

export interface CustomerDecisionResponse {
    success: boolean
    message: string
    data?: ForemanResponse
}

// List/Pagination Types
export interface ForemanResponseListParams {
    page?: number
    limit?: number
    status?: ForemanResponseStatus
    search?: string // Search by customer name, queue number
    sortBy?: 'respondedAt' | 'queueNumber' | 'assessmentNumber'
    sortOrder?: 'asc' | 'desc'
    dateFrom?: string
    dateTo?: string
}

export interface ForemanResponseListResponse {
    data: ForemanResponse[]
    total: number
    page: number
    limit: number
    totalPages: number
}

// For Display in List View
export interface ForemanResponseSummary {
    id: string
    queueNumber: string
    customerName: string
    phone: string
    motorcycleModel: string
    assessmentNumber: number
    estimatedCost: number
    status: ForemanResponseStatus
    respondedAt: string
    customerDecision?: CustomerDecision
}
