import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { motorcyclesService } from '../../services/api/motorcycles.service';
import type { CreateMotorcycleDto } from '../../services/api/types';
import { customersService } from '../../services/api/customers.service';

export const MotorcycleCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId');

  const [formData, setFormData] = useState<CreateMotorcycleDto>({
    vin: '',
    licensePlate: '',
    brand: '',
    model: '',
    color: '',
    year: undefined,
    engineNo: '',
    ownerId: customerIdParam ? +customerIdParam : 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customerIdParam) {
      setFormData((prev) => ({ ...prev, ownerId: +customerIdParam }));
    }
  }, [customerIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerId) {
      setError('กรุณาเลือกเจ้าของรถ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const motorcycle = await motorcyclesService.create(formData);
      navigate(`/reception/customers/${formData.ownerId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างข้อมูลรถได้');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateMotorcycleDto, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">เพิ่มรถใหม่</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลรถ</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="vin" className="form-label">
                เลขตัวถัง (VIN) <span className="text-red-500">*</span>
              </label>
              <input
                id="vin"
                type="text"
                value={formData.vin}
                onChange={(e) => handleChange('vin', e.target.value)}
                className="form-input"
                placeholder="MM123456789"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="licensePlate" className="form-label">
                ทะเบียนรถ <span className="text-red-500">*</span>
              </label>
              <input
                id="licensePlate"
                type="text"
                value={formData.licensePlate}
                onChange={(e) => handleChange('licensePlate', e.target.value)}
                className="form-input"
                placeholder="1กข-1234"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand" className="form-label">
                ยี่ห้อ <span className="text-red-500">*</span>
              </label>
              <input
                id="brand"
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="form-input"
                placeholder="Honda"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="model" className="form-label">
                รุ่น <span className="text-red-500">*</span>
              </label>
              <input
                id="model"
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="form-input"
                placeholder="Wave 110i"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="color" className="form-label">
                สี <span className="text-red-500">*</span>
              </label>
              <input
                id="color"
                type="text"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="form-input"
                placeholder="แดง-ขาว"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="year" className="form-label">
                ปี
              </label>
              <input
                id="year"
                type="number"
                value={formData.year || ''}
                onChange={(e) => handleChange('year', e.target.value ? +e.target.value : undefined as any)}
                className="form-input"
                placeholder="2023"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="form-group">
              <label htmlFor="engineNo" className="form-label">
                เลขเครื่อง
              </label>
              <input
                id="engineNo"
                type="text"
                value={formData.engineNo}
                onChange={(e) => handleChange('engineNo', e.target.value)}
                className="form-input"
                placeholder="E123-45678"
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
                กำลังบันทึก...
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
            onClick={() => navigate(-1)}
            className="btn btn-outline"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};
