import { useState, useEffect } from 'react';
import { Plus, Save, ArrowLeft, Package, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { partsService } from '../../services/api/parts.service';
import type { Part } from '../../services/api/types';

export const GoodsReceiptPage = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [receiptNo, setReceiptNo] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [items, setItems] = useState<
    Array<{
      partId: number | '';
      quantity: number;
      unitPrice: number;
      batchNo?: string;
      expiryDate?: string;
      notes?: string;
    }>
  >([{ partId: '', quantity: 1, unitPrice: 0 }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    setLoading(true);
    try {
      const data = await partsService.findAll({ isActive: true });
      setParts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลอะไหล่ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { partId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: any,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supplierName || !receiptDate) {
      setError('กรุณากรอกชื่อผู้จำหน่ายและวันที่รับของ');
      return;
    }

    if (items.length === 0 || items.some((i) => !i.partId || i.quantity <= 0)) {
      setError('กรุณาเพิ่มรายการอะไหล่และตรวจสอบจำนวนให้ถูกต้อง');
      return;
    }

    setSubmitting(true);
    try {
      const receiptData = {
        receiptNo: receiptNo || undefined,
        supplierName,
        supplierInvoiceNo: supplierInvoiceNo || undefined,
        receiptDate: new Date(receiptDate).toISOString(),
        items: items.map((item) => ({
          partId: Number(item.partId),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          batchNo: item.batchNo || undefined,
          expiryDate: item.expiryDate
            ? new Date(item.expiryDate).toISOString()
            : undefined,
          notes: item.notes || undefined,
        })),
        notes: notes || undefined,
      };

      const result = await partsService.createReceipt(receiptData) as any;
      alert(`บันทึกรับของเข้าสำเร็จ!\nเลขที่: ${result.receiptNo}`);
      navigate('/inventory/receipts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/inventory" className="btn btn-outline">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">รับของเข้า</h1>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ข้อมูลใบรับของ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">เลขที่ใบรับของ (ถ้าไม่ระบุจะสร้างอัตโนมัติ)</label>
              <input
                type="text"
                className="form-input"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="GR-20260108-0001"
              />
            </div>
            <div>
              <label className="form-label">วันที่รับของ <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="form-input"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">ชื่อผู้จำหน่าย <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="form-input"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">เลขที่ใบแจ้งหนี้ผู้จำหน่าย</label>
              <input
                type="text"
                className="form-input"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">หมายเหตุ</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">รายการอะไหล่</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-secondary"
            >
              <Plus className="w-5 h-5" />
              เพิ่มรายการ
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const selectedPart = parts.find((p) => p.id === item.partId);
              return (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <label className="form-label">อะไหล่ <span className="text-red-500">*</span></label>
                      <select
                        className="form-select"
                        value={item.partId || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'partId', e.target.value ? Number(e.target.value) : '')
                        }
                        required
                      >
                        <option value="">-- เลือกอะไหล่ --</option>
                        {parts.map((part) => (
                          <option key={part.id} value={part.id}>
                            {part.partNo} - {part.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">จำนวน <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', Number(e.target.value))
                        }
                        required
                      />
                      {selectedPart && (
                        <span className="text-sm text-gray-500 mt-1">
                          หน่วย: {selectedPart.unit}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="form-label">ราคาต่อหน่วย <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, 'unitPrice', Number(e.target.value))
                        }
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="btn btn-outline btn-error w-full"
                        disabled={items.length === 1}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Batch Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.batchNo || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'batchNo', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="form-label">วันหมดอายุ</label>
                      <input
                        type="date"
                        className="form-input"
                        value={item.expiryDate || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'expiryDate', e.target.value)
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">หมายเหตุ</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.notes || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'notes', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {selectedPart && (
                    <div className="mt-3 text-sm text-gray-600">
                      สต็อกปัจจุบัน: {selectedPart.stockQuantity} {selectedPart.unit}
                      {' → '}
                      สต็อกหลังรับเข้า:{' '}
                      {selectedPart.stockQuantity + item.quantity} {selectedPart.unit}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || loading}
          >
            {submitting ? (
              <>
                <div className="spinner mr-2"></div>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                บันทึก
              </>
            )}
          </button>
          <Link to="/inventory" className="btn btn-outline">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
};
