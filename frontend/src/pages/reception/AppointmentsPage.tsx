import { useState, useEffect } from 'react';
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
      setAppointments(data);
    } catch (err: any) {
      console.error('Error loading appointments:', err);
      setError(err.response?.data?.message || err.message || 'ไม่สามารถโหลดข้อมูลนัดหมายได้');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const badges: Record<string, { label: string; bg: string; text: string }> = {
      SCHEDULED: { label: 'นัดหมายแล้ว', bg: 'bg-blue-50', text: 'text-blue-600' },
      COMPLETED: { label: 'เสร็จแล้ว', bg: 'bg-emerald-50', text: 'text-emerald-600' },
      CANCELLED: { label: 'ยกเลิก', bg: 'bg-red-50', text: 'text-red-500' },
      NO_SHOW: { label: 'ไม่มาตามนัด', bg: 'bg-orange-50', text: 'text-orange-500' },
    };
    return badges[status] || { label: status, bg: 'bg-gray-50', text: 'text-gray-600' };
  };

  const getDateString = (dateStr: string): string => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const getFilteredAppointments = () => {
    const todayStr = getTodayStr();
    switch (filter) {
      case 'today':
        return appointments.filter((apt) => getDateString(apt.scheduledDate) === todayStr);
      case 'upcoming':
        return appointments.filter((apt) => getDateString(apt.scheduledDate) >= todayStr && apt.status === 'SCHEDULED');
      case 'completed':
        return appointments.filter((apt) => apt.status === 'COMPLETED');
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();
  const todayStr = getTodayStr();
  const todayCount = appointments.filter((apt) => getDateString(apt.scheduledDate) === todayStr).length;
  const upcomingCount = appointments.filter((apt) => getDateString(apt.scheduledDate) >= todayStr && apt.status === 'SCHEDULED').length;
  const completedCount = appointments.filter((apt) => apt.status === 'COMPLETED').length;

  // Group by date
  const groupedAppointments = filteredAppointments.reduce((acc, apt) => {
    const dateKey = new Date(apt.scheduledDate).toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const filterButtons = [
    { key: 'all' as const, label: 'ทั้งหมด', count: appointments.length },
    { key: 'today' as const, label: 'วันนี้', count: todayCount },
    { key: 'upcoming' as const, label: 'ที่จะมาถึง', count: upcomingCount },
    { key: 'completed' as const, label: 'เสร็จแล้ว', count: completedCount },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5]">
      <div className="p-6 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">จัดการนัดหมาย</h2>
            <p className="text-gray-500 text-sm mt-1">ดูรายการนัดหมาย จัดการตารางนัด และแปลงเป็นงานซ่อม</p>
          </div>
          <Link
            to="/reception/appointments/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 active:bg-amber-700 transition-all shadow-lg shadow-amber-500/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            นัดหมายใหม่
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                filter === btn.key
                  ? 'border-amber-400 bg-amber-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-amber-200 hover:shadow-sm'
              }`}
            >
              <p className={`text-xs font-medium mb-1 ${filter === btn.key ? 'text-amber-600' : 'text-gray-500'}`}>
                {btn.label}
              </p>
              <p className={`text-2xl font-bold ${filter === btn.key ? 'text-amber-600' : 'text-gray-800'}`}>
                {btn.count}
              </p>
              {filter === btn.key && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-500">กำลังโหลดนัดหมาย...</p>
              </div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="divide-y divide-gray-100 overflow-y-auto">
              {Object.entries(groupedAppointments).map(([date, apts]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2 sticky top-0 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">{date}</span>
                    <span className="text-xs text-gray-400 ml-1">({apts.length} รายการ)</span>
                  </div>

                  {/* Appointment Cards */}
                  {apts.map((apt) => {
                    const badge = getStatusBadge(apt.status);
                    return (
                      <div
                        key={apt.id}
                        className="px-6 py-4 hover:bg-amber-50/30 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          {/* Left: Info */}
                          <div className="flex-1 min-w-0">
                            {/* Top row: appointment no + time + status */}
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-bold text-gray-900">{apt.appointmentNo}</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                                {badge.label}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {apt.scheduledTime} น.
                              </span>
                              {apt.job && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                                  งาน: {(apt.job as any).jobNo || apt.job}
                                </span>
                              )}
                            </div>

                            {/* Detail row */}
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              {/* Customer */}
                              <span className="inline-flex items-center gap-1.5 min-w-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium text-gray-800 truncate">
                                  {apt.motorcycle?.owner?.firstName} {apt.motorcycle?.owner?.lastName}
                                </span>
                              </span>

                              {/* Phone */}
                              <span className="inline-flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{apt.motorcycle?.owner?.phoneNumber || '-'}</span>
                              </span>

                              {/* Motorcycle */}
                              <span className="inline-flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>{apt.motorcycle?.licensePlate} — {apt.motorcycle?.brand} {apt.motorcycle?.model}</span>
                              </span>
                            </div>

                            {/* Notes */}
                            {apt.notes && (
                              <div className="mt-2 text-xs text-gray-500 italic">
                                💬 {apt.notes}
                              </div>
                            )}
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 ml-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {apt.status === 'SCHEDULED' && !apt.job && (
                              <Link
                                to={`/reception/appointments/${apt.id}`}
                                className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
                              >
                                แปลงเป็นงาน
                              </Link>
                            )}
                            <Link
                              to={`/reception/appointments/${apt.id}`}
                              className="px-4 py-2 text-xs font-semibold text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                            >
                              ดูรายละเอียด
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-1 font-medium">ไม่พบนัดหมาย</p>
                <p className="text-sm text-gray-400 mb-6">
                  {filter === 'all' ? 'ยังไม่มีนัดหมายในระบบ' : `ไม่พบนัดหมายในหมวด "${filterButtons.find(b => b.key === filter)?.label}"`}
                </p>
                <Link
                  to="/reception/appointments/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/25"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  สร้างนัดหมายใหม่
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
