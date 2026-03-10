import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Bike, Plus, Search, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { appointmentsService } from '../../services/api/appointments.service';
import type { Appointment, AppointmentStatus } from '../../services/api/types';

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await appointmentsService.findAll();
      console.log('📅 Loaded appointments:', data);
      console.log('📅 Total count:', data.length);
      if (data.length > 0) {
        console.log('📅 First appointment scheduledDate:', data[0].scheduledDate);
        console.log('📅 First appointment parsed date:', new Date(data[0].scheduledDate));
      }
      setAppointments(data);
    } catch (err: any) {
      console.error('❌ Error loading appointments:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลนัดหมายได้');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const badges: Record<string, { label: string; className: string }> = {
      SCHEDULED: { label: 'นัดหมายแล้ว', className: 'badge-info' },
      COMPLETED: { label: 'เสร็จแล้ว', className: 'badge-success' },
      CANCELLED: { label: 'ยกเลิก', className: 'badge-error' },
      NO_SHOW: { label: 'ไม่มาตามนัด', className: 'badge-warning' },
    };
    return badges[status] || { label: status, className: 'badge-info' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    // timeString format: "HH:mm"
    return timeString;
  };

  // Helper function to get date string from ISO date string (handles timezone correctly)
  const getDateString = (dateStr: string): string => {
    // scheduledDate comes as ISO string like "2024-12-20T00:00:00.000Z"
    // We need to convert to local date string (YYYY-MM-DD)
    const date = new Date(dateStr);
    
    // Get local date components (not UTC)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    // Get today's date in local timezone as YYYY-MM-DD string
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    console.log('🔍 Filter:', filter);
    console.log('📅 Today string:', todayStr);
    console.log('📅 Total appointments:', appointments.length);

    let filtered: Appointment[] = [];

    switch (filter) {
      case 'today':
        filtered = appointments.filter((apt) => {
          const aptDateStr = getDateString(apt.scheduledDate);
          const isMatch = aptDateStr === todayStr;
          if (isMatch) {
            console.log('✅ Match today:', apt.appointmentNo, aptDateStr);
          }
          return isMatch;
        });
        console.log('📅 Today appointments count:', filtered.length);
        break;
        
      case 'upcoming':
        filtered = appointments.filter((apt) => {
          const aptDateStr = getDateString(apt.scheduledDate);
          const isMatch = aptDateStr >= todayStr && apt.status === 'SCHEDULED';
          return isMatch;
        });
        console.log('📅 Upcoming appointments count:', filtered.length);
        break;
        
      case 'completed':
        filtered = appointments.filter((apt) => apt.status === 'COMPLETED');
        console.log('📅 Completed appointments count:', filtered.length);
        break;
        
      default:
        filtered = appointments;
        break;
    }

    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();

  // Calculate counts for each filter
  const todayCount = appointments.filter((apt) => {
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    return getDateString(apt.scheduledDate) === todayStr;
  }).length;
  
  const upcomingCount = appointments.filter((apt) => {
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    return getDateString(apt.scheduledDate) >= todayStr && apt.status === 'SCHEDULED';
  }).length;
  
  const completedCount = appointments.filter((apt) => apt.status === 'COMPLETED').length;

  // Group by date
  const groupedAppointments = filteredAppointments.reduce((acc, apt) => {
    const dateKey = new Date(apt.scheduledDate).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการนัดหมาย</h1>
        <Link to="/reception/appointments/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          นัดหมายใหม่
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="card mb-6">
        <div className="flex gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ทั้งหมด ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            วันนี้ {todayCount > 0 && `(${todayCount})`}
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ที่จะมาถึง {upcomingCount > 0 && `(${upcomingCount})`}
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            เสร็จแล้ว {completedCount > 0 && `(${completedCount})`}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, apts]) => (
            <div key={date} className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                {date}
              </h2>
              <div className="space-y-4">
                {apts.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  return (
                    <div
                      key={apt.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {apt.appointmentNo}
                            </h3>
                            <span className={`badge ${statusBadge.className}`}>
                              {statusBadge.label}
                            </span>
                            {apt.job && (
                              <Link
                                to={`/reception/jobs/${apt.job.id}`}
                                className="badge badge-info"
                              >
                                งาน: {apt.job.jobNo}
                              </Link>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">เวลา:</span>
                              <span className="font-medium">{formatTime(apt.scheduledTime)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Bike className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">รถ:</span>
                              <span className="font-medium">
                                {apt.motorcycle.licensePlate} - {apt.motorcycle.brand} {apt.motorcycle.model}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">ลูกค้า:</span>
                              <span className="font-medium">
                                {apt.motorcycle.owner.firstName} {apt.motorcycle.owner.lastName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">เบอร์โทร:</span>
                              <span className="font-medium">{apt.motorcycle.owner.phoneNumber}</span>
                            </div>
                          </div>

                          {apt.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">หมายเหตุ:</span> {apt.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          {apt.status === 'SCHEDULED' && !apt.job && (
                            <Link
                              to={`/reception/appointments/${apt.id}/convert`}
                              className="btn btn-primary text-sm"
                            >
                              แปลงเป็นงาน
                            </Link>
                          )}
                          <Link
                            to={`/reception/appointments/${apt.id}`}
                            className="btn btn-outline text-sm"
                          >
                            ดูรายละเอียด
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">ไม่พบนัดหมาย</p>
          <Link to="/reception/appointments/new" className="btn btn-primary inline-block">
            <Plus className="w-5 h-5" />
            สร้างนัดหมายใหม่
          </Link>
        </div>
      )}
    </div>
  );
};
