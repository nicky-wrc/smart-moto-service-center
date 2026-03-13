import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, User, Bike, ArrowLeft, AlertCircle, Wrench, Phone } from 'lucide-react';
import { appointmentsService } from '../../services/api/appointments.service';
import type { Appointment, ConvertToJobDto } from '../../services/api/types';
import { formatMotorcycleName } from '../../utils/motorcycle';

export const AppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Convert to Job form state
  const [convertData, setConvertData] = useState<ConvertToJobDto>({
    symptom: '',
    jobType: 'NORMAL',
    fuelLevel: undefined,
    valuables: '',
  });

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const loadAppointment = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await appointmentsService.findOne(parseInt(id));
      console.log('📅 Loaded appointment:', data);
      setAppointment(data);
      
      // Auto-show convert form if appointment can be converted
      if (data.status === 'SCHEDULED' && !data.job) {
        setShowConvertForm(true);
      }
    } catch (err: any) {
      console.error('❌ Error loading appointment:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลนัดหมายได้');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !id) return;
    
    setError('');
    
    // Validation
    if (!convertData.symptom || convertData.symptom.trim() === '') {
      setError('กรุณากรอกอาการ/ปัญหาของรถ');
      return;
    }

    setSubmitting(true);
    try {
      console.log('🔧 Converting appointment to job:', convertData);
      const job: any = await appointmentsService.convertToJob(parseInt(id), convertData);
      console.log('✅ Job created:', job);
      
      // Show success message
      const jobNo = job?.jobNo || 'ไม่ทราบ';
      alert(`✅ แปลงเป็นงานสำเร็จ!\n\nหมายเลขงาน: ${jobNo}`);
      
      // Redirect back to appointments list
      navigate('/reception/appointments');
    } catch (err: any) {
      console.error('❌ Error converting to job:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'ไม่สามารถแปลงเป็นงานได้ กรุณาลองอีกครั้ง'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      SCHEDULED: { label: 'นัดหมายแล้ว', className: 'badge-info' },
      COMPLETED: { label: 'เสร็จแล้ว', className: 'badge-success' },
      CANCELLED: { label: 'ยกเลิก', className: 'badge-error' },
      NO_SHOW: { label: 'ไม่มาตามนัด', className: 'badge-warning' },
    };
    return badges[status] || { label: status, className: 'badge-info' };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">ไม่พบข้อมูลนัดหมาย</p>
        <Link to="/reception/appointments" className="btn btn-primary">
          กลับไปหน้านัดหมาย
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(appointment.status);

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
          <h1 className="text-2xl font-bold text-gray-900">รายละเอียดนัดหมาย</h1>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Appointment Information */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">ข้อมูลนัดหมาย</h2>
          <span className={`badge ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เลขที่นัดหมาย
            </label>
            <p className="text-lg font-semibold text-gray-900">{appointment.appointmentNo}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              วันที่นัดหมาย
            </label>
            <p className="text-gray-900">{formatDate(appointment.scheduledDate)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              เวลานัดหมาย
            </label>
            <p className="text-gray-900">{formatTime(appointment.scheduledTime)}</p>
          </div>

          {appointment.job && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                หมายเลขงาน
              </label>
              <Link
                to={`/workshop/jobs/${appointment.job.id}`}
                className="text-blue-600 hover:underline font-semibold"
              >
                {appointment.job.jobNo}
              </Link>
            </div>
          )}

          {appointment.notes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมายเหตุ
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer & Motorcycle Information */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ข้อมูลลูกค้าและรถ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <User className="w-4 h-4" />
              ลูกค้า
            </label>
            <p className="text-gray-900">
              {appointment.motorcycle.owner.firstName} {appointment.motorcycle.owner.lastName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              เบอร์โทรศัพท์
            </label>
            <p className="text-gray-900">{appointment.motorcycle.owner.phoneNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Bike className="w-4 h-4" />
              ทะเบียนรถ
            </label>
            <p className="text-gray-900">{appointment.motorcycle.licensePlate}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รุ่นรถ
            </label>
            <p className="text-gray-900">
              {formatMotorcycleName(appointment.motorcycle.brand, appointment.motorcycle.model)}
            </p>
          </div>

          {(appointment.motorcycle as any).color && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สีรถ
              </label>
              <p className="text-gray-900">{(appointment.motorcycle as any).color}</p>
            </div>
          )}
        </div>
      </div>

      {/* Convert to Job Form */}
      {appointment.status === 'SCHEDULED' && !appointment.job && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              แปลงเป็นงานซ่อม
            </h2>
            <button
              onClick={() => setShowConvertForm(!showConvertForm)}
              className="btn btn-outline text-sm"
            >
              {showConvertForm ? 'ซ่อน' : 'แสดง'}
            </button>
          </div>

          {showConvertForm && (
            <form onSubmit={handleConvertToJob}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อาการ/ปัญหา <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={convertData.symptom}
                    onChange={(e) => setConvertData(prev => ({ ...prev, symptom: e.target.value }))}
                    rows={4}
                    className="input"
                    placeholder="กรุณาระบุอาการหรือปัญหาของรถ เช่น เครื่องสตาร์ทไม่ติด, มีเสียงดังผิดปกติ, etc."
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเภทงาน
                    </label>
                    <select
                      value={convertData.jobType}
                      onChange={(e) => setConvertData(prev => ({ ...prev, jobType: e.target.value as 'NORMAL' | 'FAST_TRACK' }))}
                      className="input"
                      disabled={submitting}
                    >
                      <option value="NORMAL">ปกติ</option>
                      <option value="FAST_TRACK">ด่วน</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ระดับน้ำมัน (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={convertData.fuelLevel || ''}
                      onChange={(e) => setConvertData(prev => ({ ...prev, fuelLevel: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="input"
                      placeholder="เช่น 50"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ของมีค่าในรถ
                  </label>
                  <input
                    type="text"
                    value={convertData.valuables || ''}
                    onChange={(e) => setConvertData(prev => ({ ...prev, valuables: e.target.value }))}
                    className="input"
                    placeholder="เช่น กระเป๋า, โทรศัพท์, etc."
                    disabled={submitting}
                  />
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowConvertForm(false)}
                    className="btn btn-outline"
                    disabled={submitting}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner mr-2"></div>
                        กำลังแปลงเป็นงาน...
                      </>
                    ) : (
                      <>
                        <Wrench className="w-5 h-5 mr-2" />
                        แปลงเป็นงาน
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Already Converted Message */}
      {appointment.job && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">นัดหมายนี้ได้ถูกแปลงเป็นงานแล้ว</p>
              <Link
                to={`/workshop/jobs/${appointment.job.id}`}
                className="text-green-700 hover:underline mt-1 inline-block"
              >
                ดูรายละเอียดงาน: {appointment.job.jobNo}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
