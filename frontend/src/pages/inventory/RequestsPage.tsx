import { useState, useEffect } from 'react';
import { Package, Eye, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { partRequisitionsService } from '../../services/api/part-requisitions.service';
import type { PartRequisition, PartRequisitionStatus } from '../../services/api/types';

const STATUS_MAP: Record<PartRequisitionStatus, { label: string; className: string }> = {
  PENDING: { label: 'รออนุมัติ', className: 'badge-warning' },
  APPROVED: { label: 'อนุมัติแล้ว', className: 'badge-info' },
  REJECTED: { label: 'ปฏิเสธ', className: 'badge-error' },
  ISSUED: { label: 'เบิกแล้ว', className: 'badge-success' },
};

export default function RequestsPage() {
  const [requisitions, setRequisitions] = useState<PartRequisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<PartRequisitionStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadRequisitions();
  }, [filter]);

  const loadRequisitions = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (filter !== 'ALL') filters.status = filter;
      const data = await partRequisitionsService.findAll(filters);
      setRequisitions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รายการคำร้องขอเบิกอะไหล่ทั้งหมด</h1>
      </div>

      <div className="card mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'APPROVED', 'ISSUED', 'REJECTED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            >
              {s === 'ALL' ? 'ทั้งหมด' : STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      ) : requisitions.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบคำขอเบิกอะไหล่</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold">เลขที่</th>
                  <th className="text-left p-3 font-semibold">งาน</th>
                  <th className="text-left p-3 font-semibold">ผู้ขอ</th>
                  <th className="text-left p-3 font-semibold">จำนวนรายการ</th>
                  <th className="text-left p-3 font-semibold">สถานะ</th>
                  <th className="text-left p-3 font-semibold">วันที่</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req) => {
                  const statusBadge = STATUS_MAP[req.status];
                  return (
                    <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{req.reqNo}</td>
                      <td className="p-3">
                        {req.job ? (
                          <span className="text-blue-600">{req.job.jobNo}</span>
                        ) : '-'}
                      </td>
                      <td className="p-3">{req.requestedBy?.name || '-'}</td>
                      <td className="p-3">{req.items?.length || 0} รายการ</td>
                      <td className="p-3">
                        <span className={`badge ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="p-3">
                        {new Date(req.createdAt).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
