import { useState, useEffect } from 'react';
import { Plus, Eye, Send, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { quotationsService } from '../../services/api/quotations.service';
import type { Quotation } from '../../services/api/types';

export const QuotationsPage = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadQuotations();
  }, [filter]);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filter !== 'ALL') filters.status = filter;
      const data = await quotationsService.findAll(filters);
      setQuotations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (id: number) => {
    try {
      await quotationsService.send(id);
      alert('ส่ง Quotation สำเร็จ');
      loadQuotations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถส่งได้');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await quotationsService.approve(id);
      alert('อนุมัติ Quotation สำเร็จ');
      loadQuotations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถอนุมัติได้');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;
    try {
      await quotationsService.reject(id, reason);
      alert('ปฏิเสธ Quotation สำเร็จ');
      loadQuotations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถปฏิเสธได้');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'แบบร่าง', className: 'badge-info' },
      SENT: { label: 'ส่งแล้ว', className: 'badge-warning' },
      APPROVED: { label: 'อนุมัติ', className: 'badge-success' },
      REJECTED: { label: 'ปฏิเสธ', className: 'badge-error' },
    };
    return badges[status] || { label: status, className: 'badge-info' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ใบเสนอราคา</h1>
        <Link to="/billing/quotations/new" className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          สร้างใบเสนอราคาใหม่
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex gap-2">
          {['ALL', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`btn ${filter === status ? 'btn-primary' : 'btn-outline'}`}
            >
              {status === 'ALL' ? 'ทั้งหมด' : getStatusBadge(status).label}
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
      ) : quotations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">ไม่พบใบเสนอราคา</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3">เลขที่</th>
                  <th className="text-left p-3">ลูกค้า</th>
                  <th className="text-left p-3">รถ</th>
                  <th className="text-left p-3">จำนวนเงิน</th>
                  <th className="text-left p-3">สถานะ</th>
                  <th className="text-left p-3">วันที่</th>
                  <th className="text-left p-3">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quo) => {
                  const statusBadge = getStatusBadge(quo.status);
                  return (
                    <tr key={quo.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{quo.quotationNo}</td>
                      <td className="p-3">
                        {quo.customer.firstName} {quo.customer.lastName}
                      </td>
                      <td className="p-3">
                        {quo.motorcycle.licensePlate} - {quo.motorcycle.brand}{' '}
                        {quo.motorcycle.model}
                      </td>
                      <td className="p-3">
                        {quo.totalAmount.toLocaleString()} บาท
                      </td>
                      <td className="p-3">
                        <span className={`badge ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="p-3">
                        {new Date(quo.createdAt).toLocaleDateString('th-TH')}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link
                            to={`/billing/quotations/${quo.id}`}
                            className="btn btn-outline btn-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {quo.status === 'DRAFT' && (
                            <button
                              onClick={() => handleSend(quo.id)}
                              className="btn btn-primary btn-sm"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {quo.status === 'SENT' && (
                            <>
                              <button
                                onClick={() => handleApprove(quo.id)}
                                className="btn btn-success btn-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(quo.id)}
                                className="btn btn-error btn-sm"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
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
    </div>
  );
};
