import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle } from 'lucide-react';
import { motorcyclesService } from '../../services/api/motorcycles.service';
import { jobsService } from '../../services/api/jobs.service';
import type { Motorcycle, CreateJobDto, JobType } from '../../services/api/types';
import { warrantiesService } from '../../services/api/warranties.service';

export const JobCreatePage = () => {
  const navigate = useNavigate();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<number | ''>('');
  const [symptom, setSymptom] = useState('');
  const [jobType, setJobType] = useState<JobType>('NORMAL');
  const [fuelLevel, setFuelLevel] = useState<number | ''>('');
  const [valuables, setValuables] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingWarranty, setCheckingWarranty] = useState(false);

  useEffect(() => {
    loadMotorcycles();
  }, []);

  const loadMotorcycles = async () => {
    try {
      const data = await motorcyclesService.findAll();
      setMotorcycles(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลรถได้');
    }
  };

  const checkWarranty = async () => {
    if (!selectedMotorcycleId) return;

    setCheckingWarranty(true);
    try {
      const data = await warrantiesService.checkByMotorcycle(+selectedMotorcycleId);
      setWarrantyStatus(data);
    } catch (err: any) {
      setWarrantyStatus({ hasWarranty: false, message: 'ไม่สามารถตรวจสอบประกันได้' });
    } finally {
      setCheckingWarranty(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMotorcycleId) {
      setError('กรุณาเลือกรถ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const jobData: CreateJobDto = {
        motorcycleId: +selectedMotorcycleId,
        symptom,
        jobType,
        fuelLevel: fuelLevel ? +fuelLevel : undefined,
        valuables: valuables || undefined,
      };

      const job = await jobsService.create(jobData);
      navigate(`/reception/jobs/${job.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างงานได้');
    } finally {
      setLoading(false);
    }
  };

  const selectedMotorcycle = motorcycles.find(m => m.id === +selectedMotorcycleId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">เปิดงานซ่อมใหม่</h1>

      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลรถ</h2>

          <div className="form-group">
            <label htmlFor="motorcycle" className="form-label">
              เลือกรถ <span className="text-red-500">*</span>
            </label>
            <select
              id="motorcycle"
              value={selectedMotorcycleId}
              onChange={(e) => {
                setSelectedMotorcycleId(e.target.value ? +e.target.value : '');
                setWarrantyStatus(null);
              }}
              className="form-select"
              required
            >
              <option value="">-- เลือกรถ --</option>
              {motorcycles.map((moto) => (
                <option key={moto.id} value={moto.id}>
                  {moto.licensePlate} - {moto.brand} {moto.model} ({moto.owner.firstName} {moto.owner.lastName})
                </option>
              ))}
            </select>
          </div>

          {selectedMotorcycle && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">เจ้าของ:</span>
                  <span className="ml-2 font-medium">{selectedMotorcycle.owner.firstName} {selectedMotorcycle.owner.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-600">เบอร์โทร:</span>
                  <span className="ml-2 font-medium">{selectedMotorcycle.owner.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">ยี่ห้อ/รุ่น:</span>
                  <span className="ml-2 font-medium">{selectedMotorcycle.brand} {selectedMotorcycle.model}</span>
                </div>
                <div>
                  <span className="text-gray-600">เลขไมล์:</span>
                  <span className="ml-2 font-medium">{selectedMotorcycle.mileage || 0} กม.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={checkWarranty}
                disabled={checkingWarranty}
                className="btn btn-secondary mt-4"
              >
                {checkingWarranty ? 'กำลังตรวจสอบ...' : 'ตรวจสอบประกัน'}
              </button>

              {warrantyStatus && (
                <div className={`mt-4 p-3 rounded-lg ${warrantyStatus.hasWarranty ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-5 h-5 ${warrantyStatus.hasWarranty ? 'text-green-600' : 'text-yellow-600'}`} />
                    <span className={`font-medium ${warrantyStatus.hasWarranty ? 'text-green-800' : 'text-yellow-800'}`}>
                      {warrantyStatus.hasWarranty ? 'มีประกัน' : warrantyStatus.message}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดงาน</h2>

          <div className="form-group">
            <label htmlFor="jobType" className="form-label">
              ประเภทงาน <span className="text-red-500">*</span>
            </label>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType)}
              className="form-select"
              required
            >
              <option value="NORMAL">งานปกติ</option>
              <option value="FAST_TRACK">งานเร่งด่วน (Fast Track)</option>
            </select>
            {jobType === 'FAST_TRACK' && (
              <p className="mt-2 text-sm text-orange-600">
                ⚡ งานเร่งด่วนจะถูกจัดลำดับให้อยู่ต้นคิว
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="symptom" className="form-label">
              อาการ/ปัญหาที่พบ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="symptom"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="form-input"
              rows={4}
              placeholder="ระบุอาการหรือปัญหาที่พบ..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="fuelLevel" className="form-label">
                ระดับน้ำมัน (%)
              </label>
              <input
                id="fuelLevel"
                type="number"
                min="0"
                max="100"
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value ? +e.target.value : '')}
                className="form-input"
                placeholder="0-100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="valuables" className="form-label">
                ของมีค่าในรถ
              </label>
              <input
                id="valuables"
                type="text"
                value={valuables}
                onChange={(e) => setValuables(e.target.value)}
                className="form-input"
                placeholder="ระบุของมีค่า (ถ้ามี)"
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
                สร้างงานซ่อม
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reception')}
            className="btn btn-outline"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};
