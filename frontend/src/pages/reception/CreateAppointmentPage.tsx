import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Bike, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { appointmentsService } from '../../services/api/appointments.service';
import { motorcyclesService } from '../../services/api/motorcycles.service';
import type { Motorcycle, CreateAppointmentDto } from '../../services/api/types';

export const CreateAppointmentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<CreateAppointmentDto>({
    motorcycleId: 0,
    scheduledDate: '',
    scheduledTime: '09:00',
    notes: '',
  });

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadMotorcycles();
  }, []);

  const loadMotorcycles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await motorcyclesService.findAll();
      console.log('🏍️ Loaded motorcycles:', data);
      setMotorcycles(data);
      
      // Auto-select first motorcycle if available
      if (data.length > 0 && formData.motorcycleId === 0) {
        setFormData(prev => ({ ...prev, motorcycleId: data[0].id }));
      }
    } catch (err: any) {
      console.error('❌ Error loading motorcycles:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลรถได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.motorcycleId || formData.motorcycleId === 0) {
      setError('กรุณาเลือกรถจักรยานยนต์');
      return;
    }
    
    if (!formData.scheduledDate) {
      setError('กรุณาเลือกวันที่นัดหมาย');
      return;
    }
    
    if (!formData.scheduledTime) {
      setError('กรุณาเลือกเวลานัดหมาย');
      return;
    }

    setSubmitting(true);
    try {
      console.log('📅 Creating appointment:', formData);
      const appointment = await appointmentsService.create(formData);
      console.log('✅ Appointment created:', appointment);
      
      // Show success message and redirect
      alert('สร้างนัดหมายสำเร็จ!');
      navigate('/reception/appointments');
    } catch (err: any) {
      console.error('❌ Error creating appointment:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'ไม่สามารถสร้างนัดหมายได้ กรุณาลองอีกครั้ง'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateAppointmentDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate time options (08:00 - 17:00, every 30 minutes)
  const timeOptions = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/reception/appointments"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">สร้างนัดหมายใหม่</h1>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Motorcycle Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bike className="w-4 h-4 inline mr-2" />
                เลือกรถจักรยานยนต์ <span className="text-red-500">*</span>
              </label>
              {loading ? (
                <div className="text-gray-500">กำลังโหลดข้อมูลรถ...</div>
              ) : motorcycles.length === 0 ? (
                <div className="text-gray-500 p-4 bg-gray-50 rounded-lg">
                  ไม่พบข้อมูลรถ กรุณาเพิ่มรถก่อน
                  <Link
                    to="/reception/customers"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    ไปที่หน้าจัดการลูกค้า
                  </Link>
                </div>
              ) : (
                <select
                  value={formData.motorcycleId}
                  onChange={(e) => handleChange('motorcycleId', parseInt(e.target.value))}
                  className="input"
                  required
                  disabled={submitting}
                >
                  <option value={0}>-- เลือกรถ --</option>
                  {motorcycles.map((motorcycle) => (
                    <option key={motorcycle.id} value={motorcycle.id}>
                      {motorcycle.licensePlate} - {motorcycle.brand} {motorcycle.model} 
                      ({motorcycle.owner.firstName} {motorcycle.owner.lastName})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  วันที่นัดหมาย <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleChange('scheduledDate', e.target.value)}
                  min={today}
                  className="input"
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  เลือกวันที่ต้องการนัดหมาย
                </p>
              </div>

              {/* Scheduled Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  เวลานัดหมาย <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.scheduledTime}
                  onChange={(e) => handleChange('scheduledTime', e.target.value)}
                  className="input"
                  required
                  disabled={submitting}
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  เลือกเวลาที่ต้องการนัดหมาย (08:00 - 17:30)
                </p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเหตุ
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="input"
                placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี) เช่น นัดเช็คระยะ 12,000 กม., เปลี่ยนยาง, etc."
                disabled={submitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
              <Link
                to="/reception/appointments"
                className={`btn btn-outline ${submitting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || loading || motorcycles.length === 0}
              >
                {submitting ? (
                  <>
                    <div className="spinner mr-2"></div>
                    กำลังสร้าง...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    สร้างนัดหมาย
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Information Card */}
      <div className="card mt-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">💡 ข้อมูลเพิ่มเติม</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>หลังจากสร้างนัดหมายแล้ว จะสามารถแปลงเป็น Job Order ได้ในภายหลัง</li>
          <li>สามารถเลือกวันที่ตั้งแต่วันนี้เป็นต้นไป</li>
          <li>เวลาทำการ: 08:00 - 17:30 (ทุก 30 นาที)</li>
          <li>สามารถเพิ่มหมายเหตุเพื่อระบุรายละเอียดเพิ่มเติมได้</li>
        </ul>
      </div>
    </div>
  );
};
