import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { customersService } from '../../services/api/customers.service';
import type { CreateCustomerDto } from '../../services/api/types';

export const CustomerCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateCustomerDto>({
    phoneNumber: '',
    title: '',
    firstName: '',
    lastName: '',
    address: '',
    taxId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const customer = await customersService.create(formData);
      navigate(`/reception/customers/${customer.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างลูกค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateCustomerDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/reception/customers')}
          className="btn btn-outline"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">เพิ่มลูกค้าใหม่</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลลูกค้า</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="form-input"
                placeholder="0812345678"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                คำนำหน้า
              </label>
              <select
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="form-select"
              >
                <option value="">-- เลือก --</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
                <option value="บริษัท">บริษัท</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="form-input"
                placeholder="ชื่อ"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="form-input"
                placeholder="นามสกุล"
                required
              />
            </div>

            <div className="form-group md:col-span-2">
              <label htmlFor="address" className="form-label">
                ที่อยู่
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="form-input"
                rows={3}
                placeholder="ที่อยู่"
              />
            </div>

            <div className="form-group">
              <label htmlFor="taxId" className="form-label">
                เลขประจำตัวผู้เสียภาษี
              </label>
              <input
                id="taxId"
                type="text"
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                className="form-input"
                placeholder="1234567890123"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner w-5 h-5 border-2 border-white border-t-transparent"></div>
                กำลังสร้าง...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                บันทึก
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reception/customers')}
            className="btn btn-outline"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};
