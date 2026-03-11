import { useState, useEffect } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { partsService } from '../../services/api/parts.service';
import type { Part } from '../../services/api/types';

export default function PurchaseOrdersPage() {
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLowStock();
  }, []);

  const loadLowStock = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await partsService.getLowStock();
      setLowStockParts(data);
    } catch (err: any) {
      // Fallback: get all parts and filter low stock
      try {
        const allParts = await partsService.findAll({ isActive: true });
        setLowStockParts(allParts.filter(p => p.stockQuantity <= p.reorderPoint));
      } catch (e: any) {
        setError(e.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ใบสั่งซื้อ</h1>
        <span className="flex items-center gap-2 text-sm text-gray-500">
          <AlertCircle className="w-4 h-4" />
          แสดงรายการอะไหล่ที่ต้องสั่งซื้อเพิ่ม
        </span>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      ) : lowStockParts.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-gray-600">ไม่มีอะไหล่ที่ต้องสั่งซื้อเพิ่ม สต็อกเพียงพอ</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">รหัส</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ชื่ออะไหล่</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ยี่ห้อ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">สต็อกปัจจุบัน</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">จุดสั่งซื้อ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">จำนวนที่ควรสั่ง</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">ราคาต่อหน่วย</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">ประมาณการค่าใช้จ่าย</th>
                </tr>
              </thead>
              <tbody>
                {lowStockParts.map((part) => {
                  const orderQty = part.reorderQuantity || Math.max(part.reorderPoint * 2 - part.stockQuantity, 1);
                  const estCost = orderQty * Number(part.unitPrice);
                  return (
                    <tr key={part.id} className="border-b border-gray-200 hover:bg-gray-50 bg-red-50/50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{part.partNo}</span>
                        <AlertCircle className="w-4 h-4 text-red-500 inline ml-2" />
                      </td>
                      <td className="py-3 px-4">{part.name}</td>
                      <td className="py-3 px-4">{part.brand || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-red-600 font-bold">{part.stockQuantity}</span>
                        <span className="text-gray-500 ml-1">{part.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right">{part.reorderPoint} {part.unit}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-blue-600">{orderQty}</span>
                        <span className="text-gray-500 ml-1">{part.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right">฿{Number(part.unitPrice).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-semibold">฿{estCost.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={7} className="py-3 px-4 text-right">รวมประมาณการ:</td>
                  <td className="py-3 px-4 text-right text-blue-700">
                    ฿{lowStockParts.reduce((s, p) => {
                      const qty = p.reorderQuantity || Math.max(p.reorderPoint * 2 - p.stockQuantity, 1);
                      return s + qty * Number(p.unitPrice);
                    }, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
