const API_URL = 'http://localhost:3000'

export const fetchPartRequisitions = async (params: { status?: string, jobId?: string } = {}) => {
    const url = new URL(`${API_URL}/part-requisitions`)
    if (params.status) url.searchParams.append('status', params.status)
    if (params.jobId) url.searchParams.append('jobId', params.jobId)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Failed to fetch part requisitions')
    return res.json()
}

export const fetchPartRequisitionById = async (id: string | number) => {
    const res = await fetch(`${API_URL}/part-requisitions/${id}`)
    if (!res.ok) throw new Error(`Failed to fetch part requisition ${id}`)
    return res.json()
}

export const issuePartRequisition = async (id: string | number, dto: { notes?: string, issuedItems?: { id: number, issuedQuantity: number }[] }) => {
    const res = await fetch(`${API_URL}/part-requisitions/${id}/issue`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}` // uncomment when auth is implemented
        },
        body: JSON.stringify(dto)
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to issue parts')
    }
    return res.json()
}

export const rejectPartRequisition = async (id: string | number, notes?: string) => {
    const res = await fetch(`${API_URL}/part-requisitions/${id}/reject`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes })
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to reject part requisition')
    }
    return res.json()
}
