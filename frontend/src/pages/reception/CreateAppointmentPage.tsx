import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentsService } from '../../services/api/appointments.service';
import { motorcyclesService } from '../../services/api/motorcycles.service';
import type { Motorcycle, CreateAppointmentDto } from '../../services/api/types';
import { formatMotorcycleName } from '../../utils/motorcycle';

export const CreateAppointmentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<CreateAppointmentDto>({
    motorcycleId: 0,
    scheduledDate: '',
    scheduledTime: '09:00',
    notes: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadMotorcycles();
  }, []);

  const loadMotorcycles = async () => {
    setLoading(true);
    try {
      const data = await motorcyclesService.findAll();
      setMotorcycles(data);
      if (data.length > 0 && formData.motorcycleId === 0) {
        setFormData(prev => ({ ...prev, motorcycleId: data[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลรถได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      await appointmentsService.create(formData);
      setSuccess(true);
      setTimeout(() => navigate('/reception/appointments'), 1500);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถสร้างนัดหมายได้ กรุณาลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateAppointmentDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Time options 08:00 - 17:30
  const timeOptions: string[] = [];
  for (let h = 8; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeOptions.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  // Filter motorcycles by search query
  const filteredMotorcycles = motorcycles.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const full = `${m.licensePlate} ${formatMotorcycleName(m.brand, m.model)} ${m.owner?.firstName} ${m.owner?.lastName} ${m.owner?.phoneNumber}`.toLowerCase();
    return full.includes(q);
  });

  // Get the selected motorcycle details
  const selectedMoto = motorcycles.find(m => m.id === formData.motorcycleId);

  // Success screen
  if (success) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">สร้างนัดหมายสำเร็จ!</h2>
          <p className="text-gray-500 text-sm">กำลังไปยังหน้ารายการนัดหมาย...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5]">
      <div className="p-6 w-full flex-1 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 mb-3 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            ย้อนกลับ
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">สร้างนัดหมายใหม่</h2>
          <p className="text-gray-500 text-sm mt-1">เลือกรถ กำหนดวันเวลา และเพิ่มหมายเหตุสำหรับการนัดหมาย</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: เลือกรถ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-base font-semibold text-gray-800">เลือกรถจักรยานยนต์ <span className="text-red-400">*</span></h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-6">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">กำลังโหลดข้อมูลรถ...</p>
                </div>
              ) : motorcycles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">ไม่พบข้อมูลรถในระบบ</p>
                  <Link to="/reception" className="text-amber-600 text-sm font-medium hover:underline">
                    ไปเพิ่มลูกค้าและรถก่อน →
                  </Link>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="relative mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาจากป้ายทะเบียน, ยี่ห้อ, ชื่อลูกค้า..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Motorcycle Select */}
                  <select
                    value={formData.motorcycleId}
                    onChange={(e) => handleChange('motorcycleId', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all appearance-none"
                    required
                    disabled={submitting}
                  >
                    <option value={0}>-- เลือกรถ --</option>
                    {filteredMotorcycles.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.licensePlate} — {formatMotorcycleName(m.brand, m.model)} ({m.owner?.firstName} {m.owner?.lastName})
                      </option>
                    ))}
                  </select>

                  {/* Selected Motorcycle Preview */}
                  {selectedMoto && (
                    <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs">ป้ายทะเบียน</span>
                          <p className="font-semibold text-gray-800">{selectedMoto.licensePlate}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">ยี่ห้อ/รุ่น</span>
                          <p className="font-semibold text-gray-800">{formatMotorcycleName(selectedMoto.brand, selectedMoto.model)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">เจ้าของ</span>
                          <p className="font-semibold text-gray-800">{selectedMoto.owner?.firstName} {selectedMoto.owner?.lastName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">เบอร์โทร</span>
                          <p className="font-semibold text-gray-800">{selectedMoto.owner?.phoneNumber || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Section 2: วันเวลา */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-base font-semibold text-gray-800">กำหนดวันเวลา <span className="text-red-400">*</span></h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">วันที่นัดหมาย</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleChange('scheduledDate', e.target.value)}
                    min={today}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all"
                    required
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-400 mt-1.5">เลือกวันที่ตั้งแต่วันนี้เป็นต้นไป</p>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">เวลานัดหมาย</label>
                  <select
                    value={formData.scheduledTime}
                    onChange={(e) => handleChange('scheduledTime', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all appearance-none"
                    required
                    disabled={submitting}
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time} น.
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">เวลาทำการ 08:00 - 17:30</p>
                </div>
              </div>

              {/* Quick Date Buttons */}
              <div className="flex gap-2 mt-4">
                {[
                  { label: 'วันนี้', offset: 0 },
                  { label: 'พรุ่งนี้', offset: 1 },
                  { label: 'มะรืนนี้', offset: 2 },
                  { label: 'สัปดาห์หน้า', offset: 7 },
                ].map(({ label, offset }) => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const val = d.toISOString().split('T')[0];
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleChange('scheduledDate', val)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        formData.scheduledDate === val
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: หมายเหตุ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="text-base font-semibold text-gray-800">หมายเหตุ</h3>
              <span className="text-xs text-gray-400">(ไม่บังคับ)</span>
            </div>
            <div className="p-6">
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all resize-none"
                placeholder="เช่น นัดเช็คระยะ 12,000 กม., เปลี่ยนยาง, เปลี่ยนถ่ายน้ำมันเครื่อง"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Info Tip */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 mb-1">ข้อมูลเพิ่มเติม</p>
                <ul className="text-xs text-amber-700 space-y-0.5">
                  <li>• หลังสร้างนัดหมายแล้ว สามารถแปลงเป็น Job Order ได้ในภายหลัง</li>
                  <li>• ลูกค้าจะถูกแจ้งเตือนนัดหมายตามเบอร์โทรที่ลงทะเบียนไว้</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pb-6">
            <Link
              to="/reception/appointments"
              className={`min-w-[140px] px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-600 text-sm font-semibold bg-white hover:bg-gray-50 active:bg-gray-100 transition-all text-center ${submitting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="min-w-[180px] px-6 py-3 rounded-xl border-2 border-transparent text-white text-sm font-semibold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={submitting || loading || motorcycles.length === 0}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  สร้างนัดหมาย
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
