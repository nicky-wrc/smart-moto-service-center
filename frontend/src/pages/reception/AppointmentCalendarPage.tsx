import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { appointmentsService } from '../../services/api/appointments.service';
import type { Appointment, AppointmentStatus } from '../../services/api/types';

export const AppointmentCalendarPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await appointmentsService.findAll();
      setAppointments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลนัดหมายได้');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
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

  // Get appointments for selected date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledDate).toISOString().split('T')[0];
      return aptDate === dateStr && apt.status === 'SCHEDULED';
    });
  };

  // Simple calendar view
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, idx) => (
          <div key={idx} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, idx) => {
          if (!date) {
            return <div key={idx} className="h-20"></div>;
          }

          const dayAppointments = getAppointmentsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`h-20 border border-gray-200 rounded-lg p-1 cursor-pointer hover:border-orange-500 transition ${
                isToday ? 'bg-blue-50 border-blue-500' : ''
              } ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {date.getDate()}
              </div>
              {dayAppointments.length > 0 && (
                <div className="mt-1">
                  <div className="text-xs bg-orange-500 text-white rounded px-1 py-0.5">
                    {dayAppointments.length} นัด
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const selectedDateAppointments = selectedDate
    ? getAppointmentsForDate(selectedDate)
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ปฏิทินนัดหมาย</h1>
        <Link to="/reception/appointments/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          นัดหมายใหม่
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
              })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
                }}
                className="btn btn-outline text-sm"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="btn btn-outline text-sm"
              >
                วันนี้
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
                }}
                className="btn btn-outline text-sm"
              >
                ›
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="spinner mx-auto"></div>
              <p className="mt-4 text-gray-600">กำลังโหลด...</p>
            </div>
          ) : (
            renderCalendar()
          )}
        </div>

        {/* Selected Date Appointments */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDate
              ? `นัดหมายวันที่ ${selectedDate.toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}`
              : 'เลือกวันที่เพื่อดูนัดหมาย'}
          </h2>

          {selectedDate ? (
            selectedDateAppointments.length > 0 ? (
              <div className="space-y-3">
                {selectedDateAppointments.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  return (
                    <div
                      key={apt.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-orange-500 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {apt.appointmentNo}
                        </span>
                        <span className={`badge ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatTime(apt.scheduledTime)}
                        </div>
                        <div>
                          <strong>รถ:</strong> {apt.motorcycle.licensePlate}
                        </div>
                        <div>
                          <strong>ลูกค้า:</strong> {apt.motorcycle.owner.firstName}{' '}
                          {apt.motorcycle.owner.lastName}
                        </div>
                        {apt.notes && (
                          <div className="mt-2 text-xs text-gray-500">
                            {apt.notes}
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <Link
                          to={`/reception/appointments/${apt.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          ดูรายละเอียด →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>ไม่มีนัดหมายในวันนี้</p>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>คลิกวันที่ในปฏิทินเพื่อดูนัดหมาย</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
