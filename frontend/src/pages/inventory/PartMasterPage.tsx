import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { partsService } from '../../services/api/parts.service';
import type { Part, CreatePartDto, UpdatePartDto } from '../../services/api/types';

export const PartMasterPage = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState<CreatePartDto>({
    partNo: '',
    name: '',
    description: '',
    brand: '',
    category: '',
    unit: 'ชิ้น',
    unitPrice: 0,
    stockQuantity: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
  });

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    setLoading(true);
    try {
      const filters: any = { isActive: true };
      if (searchTerm) filters.search = searchTerm;
      const data = await partsService.findAll(filters);
      setParts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingPart) {
        await partsService.update(editingPart.id, formData as UpdatePartDto);
      } else {
        await partsService.create(formData);
      }
      setShowForm(false);
      setEditingPart(null);
      setFormData({
        partNo: '',
        name: '',
        description: '',
        brand: '',
        category: '',
        unit: 'ชิ้น',
        unitPrice: 0,
        stockQuantity: 0,
        reorderPoint: 0,
        reorderQuantity: 0,
      });
      loadParts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setFormData({
      partNo: part.partNo,
      name: part.name,
      description: part.description || '',
      brand: part.brand || '',
      category: part.category || '',
      unit: part.unit,
      unitPrice: Number(part.unitPrice),
      stockQuantity: part.stockQuantity,
      reorderPoint: part.reorderPoint,
      reorderQuantity: part.reorderQuantity,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบอะไหล่นี้?')) return;

    try {
      await partsService.delete(id);
      loadParts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถลบข้อมูลได้');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการอะไหล่</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPart(null);
            setFormData({
              partNo: '',
              name: '',
              description: '',
              brand: '',
              category: '',
              unit: 'ชิ้น',
              unitPrice: 0,
              stockQuantity: 0,
              reorderPoint: 0,
              reorderQuantity: 0,
            });
          }}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          เพิ่มอะไหล่
        </button>
      </div>

      {/* Search */}
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
          <button onClick={loadParts} className="btn btn-secondary">
            ค้นหา
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPart ? 'แก้ไขอะไหล่' : 'เพิ่มอะไหล่ใหม่'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">รหัสอะไหล่ *</label>
                  <input
                    type="text"
                    value={formData.partNo}
                    onChange={(e) => setFormData({ ...formData, partNo: e.target.value })}
                    className="form-input"
                    required
                    disabled={!!editingPart}
                  />
                </div>
                <div>
                  <label className="form-label">ชื่ออะไหล่ *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">ยี่ห้อ</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">หมวดหมู่</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">หน่วย *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">ราคาต่อหน่วย *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: +e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">จำนวนสต็อก</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: +e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">จุดสั่งซื้อ</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: +e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">จำนวนสั่งซื้อ</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderQuantity}
                    onChange={(e) => setFormData({ ...formData, reorderQuantity: +e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">คำอธิบาย</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  rows={3}
                />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPart(null);
                  }}
                  className="btn btn-outline"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parts List */}
      {loading && !showForm ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      ) : parts.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">รหัส</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ชื่อ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ยี่ห้อ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ราคา</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">สต็อก</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">จุดสั่งซื้อ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{part.partNo}</span>
                      {part.stockQuantity <= part.reorderPoint && (
                        <AlertCircle className="w-4 h-4 text-red-500 inline ml-2" />
                      )}
                    </td>
                    <td className="py-3 px-4">{part.name}</td>
                    <td className="py-3 px-4">{part.brand || '-'}</td>
                    <td className="py-3 px-4">฿{Number(part.unitPrice).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={part.stockQuantity <= part.reorderPoint ? 'text-red-600 font-medium' : ''}>
                        {part.stockQuantity} {part.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4">{part.reorderPoint} {part.unit}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(part)}
                          className="btn btn-outline btn-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(part.id)}
                          className="btn btn-outline btn-error btn-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบอะไหล่</p>
        </div>
      )}
    </div>
  );
};
