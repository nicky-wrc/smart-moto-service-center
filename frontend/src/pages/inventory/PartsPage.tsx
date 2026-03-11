import { useState, useEffect } from 'react';
import { Search, Package, AlertCircle } from 'lucide-react';
import { partsService } from '../../services/api/parts.service';
import type { Part } from '../../services/api/types';

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = { isActive: true };
      if (searchTerm) filters.search = searchTerm;
      if (categoryFilter) filters.category = categoryFilter;
      const data = await partsService.findAll(filters);
      setParts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(parts.map(p => p.category).filter(Boolean))];
  const lowStockCount = parts.filter(p => p.stockQuantity <= p.reorderPoint).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รายการอะไหล่ทั้งหมด</h1>
        {lowStockCount > 0 && (
          <span className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            สต็อกต่ำ {lowStockCount} รายการ
          </span>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาอะไหล่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadParts()}
              className="form-input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setTimeout(loadParts, 0); }}
            className="form-select"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={loadParts} className="btn btn-secondary">
            ค้นหา
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      ) : parts.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบอะไหล่</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">รหัส</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ชื่อ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ยี่ห้อ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">หมวดหมู่</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">ราคา</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">สต็อก</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">จุดสั่งซื้อ</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className={`border-b border-gray-200 hover:bg-gray-50 ${part.stockQuantity <= part.reorderPoint ? 'bg-red-50' : ''}`}>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{part.partNo}</span>
                      {part.stockQuantity <= part.reorderPoint && (
                        <AlertCircle className="w-4 h-4 text-red-500 inline ml-2" />
                      )}
                    </td>
                    <td className="py-3 px-4">{part.name}</td>
                    <td className="py-3 px-4">{part.brand || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-info">{part.category || '-'}</span>
                    </td>
                    <td className="py-3 px-4 text-right">฿{Number(part.unitPrice).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={part.stockQuantity <= part.reorderPoint ? 'text-red-600 font-bold' : ''}>
                        {part.stockQuantity} {part.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{part.reorderPoint} {part.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
