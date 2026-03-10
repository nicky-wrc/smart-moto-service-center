import { useState, useEffect } from 'react';
import { CheckCircle, X, Package, AlertCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { partRequisitionsService } from '../../services/api/part-requisitions.service';
import type { PartRequisition, PartRequisitionStatus } from '../../services/api/types';

export const IssueRequisitionsPage = () => {
  const [requisitions, setRequisitions] = useState<PartRequisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<PartRequisitionStatus | 'ALL'>('ALL');
  const [selectedReq, setSelectedReq] = useState<PartRequisition | null>(null);

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

  const handleApprove = async (id: number) => {
    if (!confirm('ต้องการอนุมัติคำขอเบิกนี้หรือไม่?')) return;
    try {
      await partRequisitionsService.approve(id, {});
      alert('อนุมัติสำเร็จ');
      loadRequisitions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถอนุมัติได้');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;
    try {
      await partRequisitionsService.reject(id, { reason });
      alert('ปฏิเสธสำเร็จ');
      loadRequisitions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถปฏิเสธได้');
    }
  };

  const handleIssue = async (req: PartRequisition) => {
    if (!confirm('ต้องการเบิกอะไหล่ตามคำขอนี้หรือไม่?')) return;
    
    const issueItems = req.items.map((item) => ({
      itemId: item.id,
      issuedQuantity: item.requestedQuantity,
      notes: '',
    }));

    try {
      await partRequisitionsService.issue(req.id, {
        items: issueItems,
        notes: '',
      });
      alert('เบิกอะไหล่สำเร็จ');
      loadRequisitions();
      setSelectedReq(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถเบิกอะไหล่ได้');
    }
  };

  const getStatusBadge = (status: PartRequisitionStatus) => {
    const badges: Record<PartRequisitionStatus, { label: string; className: string }> = {
      PENDING: { label: 'รออนุมัติ', className: 'badge-warning' },
      APPROVED: { label: 'อนุมัติแล้ว', className: 'badge-info' },
      REJECTED: { label: 'ปฏิเสธ', className: 'badge-error' },
      ISSUED: { label: 'เบิกแล้ว', className: 'badge-success' },
    };
    return badges[status];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">อนุมัติและเบิกอะไหล่</h1>
      </div>

      <div className="card mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`btn ${filter === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
          >
            รออนุมัติ
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`btn ${filter === 'APPROVED' ? 'btn-primary' : 'btn-outline'}`}
          >
            อนุมัติแล้ว
          </button>
          <button
            onClick={() => setFilter('ISSUED')}
            className={`btn ${filter === 'ISSUED' ? 'btn-primary' : 'btn-outline'}`}
          >
            เบิกแล้ว
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

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
                  <th className="text-left p-3">เลขที่</th>
                  <th className="text-left p-3">งาน</th>
                  <th className="text-left p-3">ผู้ขอ</th>
                  <th className="text-left p-3">จำนวนรายการ</th>
                  <th className="text-left p-3">สถานะ</th>
                  <th className="text-left p-3">วันที่</th>
                  <th className="text-left p-3">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req) => {
                  const statusBadge = getStatusBadge(req.status);
                  return (
                    <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{req.reqNo}</td>
                      <td className="p-3">
                        {req.job ? (
                          <Link to={`/workshop/jobs/${req.job.id}`} className="text-blue-600 hover:underline">
                            {req.job.jobNo}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3">{req.requestedBy.name}</td>
                      <td className="p-3">{req.items?.length || 0} รายการ</td>
                      <td className="p-3">
                        <span className={`badge ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="p-3">
                        {new Date(req.createdAt).toLocaleDateString('th-TH')}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedReq(req)}
                            className="btn btn-outline btn-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="btn btn-success btn-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="btn btn-error btn-sm"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {req.status === 'APPROVED' && (
                            <button
                              onClick={() => handleIssue(req)}
                              className="btn btn-primary btn-sm"
                            >
                              <Package className="w-4 h-4" />
                              เบิก
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">รายละเอียดคำขอเบิก</h2>
                <button
                  onClick={() => setSelectedReq(null)}
                  className="btn btn-outline btn-sm"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600">เลขที่: </span>
                  <span className="font-medium">{selectedReq.reqNo}</span>
                </div>
                <div>
                  <span className="text-gray-600">ผู้ขอ: </span>
                  <span className="font-medium">{selectedReq.requestedBy.name}</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">รายการอะไหล่:</h3>
                  <div className="space-y-2">
                    {selectedReq.items.map((item, idx) => (
                      <div key={idx} className="p-3 border border-gray-200 rounded">
                        {item.part ? (
                          <>
                            <div className="font-medium">{item.part.partNo} - {item.part.name}</div>
                            <div className="text-sm text-gray-600">
                              ขอ: {item.requestedQuantity} {item.part.unit} | 
                              เบิก: {item.issuedQuantity || 0} {item.part.unit}
                            </div>
                            <div className="text-sm text-gray-600">
                              สต็อก: {item.part.stockQuantity} {item.part.unit}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium">
                              {item.package?.packageNo} - {item.package?.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              ขอ: {item.requestedQuantity} ชุด | 
                              เบิก: {item.issuedQuantity || 0} ชุด
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setSelectedReq(null)}
                  className="btn btn-outline flex-1"
                >
                  ปิด
                </button>
                {selectedReq.status === 'APPROVED' && (
                  <button
                    onClick={() => handleIssue(selectedReq)}
                    className="btn btn-primary flex-1"
                  >
                    เบิกอะไหล่
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
