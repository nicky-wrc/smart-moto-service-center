import { useState, useEffect } from 'react';
import { Package, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { partsService } from '../../services/api/parts.service';
import type { Part } from '../../services/api/types';

export default function InventoryReportsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await partsService.findAll({ isActive: true });
      setParts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const totalItems = parts.length;
  const totalStock = parts.reduce((s, p) => s + p.stockQuantity, 0);
  const totalValue = parts.reduce((s, p) => s + p.stockQuantity * Number(p.unitPrice), 0);
  const lowStockItems = parts.filter(p => p.stockQuantity <= p.reorderPoint);
  const outOfStockItems = parts.filter(p => p.stockQuantity === 0);
  const categories = [...new Set(parts.map(p => p.category).filter(Boolean))];

  const categoryStats = categories.map(cat => {
    const catParts = parts.filter(p => p.category === cat);
    return {
      category: cat,
      count: catParts.length,
      totalStock: catParts.reduce((s, p) => s + p.stockQuantity, 0),
      totalValue: catParts.reduce((s, p) => s + p.stockQuantity * Number(p.unitPrice), 0),
      lowStock: catParts.filter(p => p.stockQuantity <= p.reorderPoint).length,
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">รายงานสต็อก</h1>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">รายการอะไหล่ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">สต็อกรวม</p>
              <p className="text-2xl font-bold text-gray-900">{totalStock.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">มูลค่ารวม</p>
              <p className="text-2xl font-bold text-gray-900">฿{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">สต็อกต่ำ / หมด</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length} / {outOfStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">สรุปตามหมวดหมู่</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">หมวดหมู่</th>
                <th className="text-right py-3 px-4 font-semibold">จำนวนรายการ</th>
                <th className="text-right py-3 px-4 font-semibold">สต็อกรวม</th>
                <th className="text-right py-3 px-4 font-semibold">มูลค่า</th>
                <th className="text-right py-3 px-4 font-semibold">สต็อกต่ำ</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map(cat => (
                <tr key={cat.category} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{cat.category}</td>
                  <td className="py-3 px-4 text-right">{cat.count}</td>
                  <td className="py-3 px-4 text-right">{cat.totalStock.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">฿{cat.totalValue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    {cat.lowStock > 0 ? (
                      <span className="text-red-600 font-bold">{cat.lowStock}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low stock items */}
      {lowStockItems.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            อะไหล่ที่ต้องเติม ({lowStockItems.length} รายการ)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">รหัส</th>
                  <th className="text-left py-3 px-4 font-semibold">ชื่อ</th>
                  <th className="text-right py-3 px-4 font-semibold">คงเหลือ</th>
                  <th className="text-right py-3 px-4 font-semibold">จุดสั่งซื้อ</th>
                  <th className="text-right py-3 px-4 font-semibold">ขาดอีก</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(part => (
                  <tr key={part.id} className="border-b border-gray-100 bg-red-50/50 hover:bg-red-50">
                    <td className="py-3 px-4 font-medium">{part.partNo}</td>
                    <td className="py-3 px-4">{part.name}</td>
                    <td className="py-3 px-4 text-right text-red-600 font-bold">
                      {part.stockQuantity} {part.unit}
                    </td>
                    <td className="py-3 px-4 text-right">{part.reorderPoint} {part.unit}</td>
                    <td className="py-3 px-4 text-right font-bold text-orange-600">
                      {Math.max(0, part.reorderPoint - part.stockQuantity)} {part.unit}
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
}
