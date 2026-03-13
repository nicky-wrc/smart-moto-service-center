import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { outsourcesService } from '../../services/api/outsources.service';
import type { CreateOutsourceDto } from '../../services/api/types';

interface OutsourceModalProps {
  jobId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const OutsourceModal = ({ jobId, onClose, onSuccess }: OutsourceModalProps) => {
  const [formData, setFormData] = useState<CreateOutsourceDto>({
    jobId,
    vendorName: '',
    description: '',
    cost: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.vendorName || !formData.description || formData.cost <= 0) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    try {
      await outsourcesService.create(formData);
      alert('บันทึก Outsource สำเร็จ!');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">บันทึก Outsource</h2>
            <button onClick={onClose} className="btn btn-outline btn-sm">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="form-label">
                  ชื่อร้าน/ผู้ให้บริการ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.vendorName}
                  onChange={(e) =>
                    setFormData({ ...formData, vendorName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  รายละเอียดงาน <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div>
                <label className="form-label">
                  ราคา (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline flex-1"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={submitting}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
