import { useState, useEffect } from 'react';
import { Calendar, Package, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { partsService } from '../../services/api/parts.service';

export const ReceiptHistoryPage = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (supplierFilter) filters.supplier = supplierFilter;
      const data = await partsService.getReceipts(filters);
      setReceipts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadReceipts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ประวัติการรับของเข้า</h1>
        <Link to="/inventory/receipts/new" className="btn btn-primary">
          <Package className="w-5 h-5 mr-2" />
          รับของเข้าใหม่
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">ตัวกรอง</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div>
            <label className="form-label">ชื่อผู้จำหน่าย</label>
            <input
              type="text"
              className="form-input"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              placeholder="ค้นหาตามชื่อผู้จำหน่าย"
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleFilter} className="btn btn-secondary w-full">
              <Search className="w-5 h-5 mr-2" />
              กรอง
            </button>
          </div>
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
      ) : receipts.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบข้อมูลการรับของเข้า</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3">เลขที่ใบรับของ</th>
                  <th className="text-left p-3">วันที่รับ</th>
                  <th className="text-left p-3">ผู้จำหน่าย</th>
                  <th className="text-left p-3">เลขที่ใบแจ้งหนี้</th>
                  <th className="text-left p-3">จำนวนรายการ</th>
                  <th className="text-left p-3">ผู้บันทึก</th>
                  <th className="text-left p-3">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt: any) => (
                  <tr key={receipt.receiptNo} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium">{receipt.receiptNo}</td>
                    <td className="p-3">
                      {new Date(receipt.receiptDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="p-3">{receipt.supplierName}</td>
                    <td className="p-3">{receipt.supplierInvoiceNo || '-'}</td>
                    <td className="p-3">{receipt.items?.length || 0} รายการ</td>
                    <td className="p-3">{receipt.createdBy || '-'}</td>
                    <td className="p-3">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => {
                          alert(`รายละเอียด:\n${JSON.stringify(receipt.items, null, 2)}`);
                        }}
                      >
                        ดูรายละเอียด
                      </button>
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
