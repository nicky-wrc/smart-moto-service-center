import { useState, useEffect } from 'react';
import { Eye, DollarSign, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paymentsService } from '../../services/api/payments.service';
import type { Payment } from '../../services/api/types';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      const data = await paymentsService.findAll(filters);
      setPayments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadPayments();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">การชำระเงิน</h1>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">วันที่เริ่มต้น</label>
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">วันที่สิ้นสุด</label>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleFilter} className="btn btn-secondary w-full">
              <Calendar className="w-5 h-5 mr-2" />
              กรอง
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="card text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบข้อมูลการชำระเงิน</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3">เลขที่</th>
                  <th className="text-left p-3">งาน</th>
                  <th className="text-left p-3">จำนวนเงิน</th>
                  <th className="text-left p-3">วิธีการชำระ</th>
                  <th className="text-left p-3">สถานะ</th>
                  <th className="text-left p-3">วันที่</th>
                  <th className="text-left p-3">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium">{payment.paymentNo}</td>
                    <td className="p-3">
                      <Link
                        to={`/workshop/jobs/${payment.job.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {payment.job.jobNo}
                      </Link>
                    </td>
                    <td className="p-3">
                      {payment.amount.toLocaleString()} บาท
                    </td>
                    <td className="p-3">{payment.paymentMethod}</td>
                    <td className="p-3">
                      <span
                        className={`badge ${
                          payment.status === 'PAID'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >
                        {payment.status === 'PAID' ? 'ชำระแล้ว' : 'รอชำระ'}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(payment.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/billing/payments/${payment.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
