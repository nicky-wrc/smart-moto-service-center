import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Bike,
  User,
  Wrench,
  Play,
  Check,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { jobsService } from '../../services/api/jobs.service';
import { jobChecklistsService } from '../../services/api/job-checklists.service';
import type {
  Job,
  JobChecklistItem,
  CreateChecklistItemDto,
} from '../../services/api/types';

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [checklistItems, setChecklistItems] = useState<JobChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [showOutsourceModal, setShowOutsourceModal] = useState(false);
  const [newItem, setNewItem] = useState<CreateChecklistItemDto>({
    itemName: '',
    condition: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [jobData, checklistData] = await Promise.all([
        jobsService.findOne(+id),
        jobChecklistsService.findByJob(+id),
      ]);
      setJob(jobData);
      setChecklistItems(checklistData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newItem.itemName || !newItem.condition) return;

    try {
      const item = await jobChecklistsService.createItem(+id, newItem);
      setChecklistItems([...checklistItems, item]);
      setNewItem({ itemName: '', condition: '', notes: '' });
      setShowAddChecklist(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถเพิ่มรายการได้');
    }
  };

  const handleDeleteChecklistItem = async (itemId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) return;

    try {
      await jobChecklistsService.delete(itemId);
      setChecklistItems(checklistItems.filter((item) => item.id !== itemId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถลบรายการได้');
    }
  };

  const handleStartJob = async () => {
    if (!job || !id) return;

    if (job.status !== 'PENDING' && job.status !== 'WAITING_PARTS') {
      alert('สามารถเริ่มงานได้เฉพาะงานที่ status เป็น PENDING หรือ WAITING_PARTS เท่านั้น');
      return;
    }

    if (!confirm(`ต้องการเริ่มงาน ${job.jobNo} หรือไม่?`)) {
      return;
    }

    setStarting(true);
    setError('');
    try {
      console.log('🚀 Starting job:', job.id);
      const updatedJob = await jobsService.startJob(+id);
      console.log('✅ Job started:', updatedJob);
      
      // Update job state
      setJob(updatedJob);
      
      alert(`✅ เริ่มงานสำเร็จ!\n\nหมายเลขงาน: ${updatedJob.jobNo}\nสถานะ: ${getStatusBadge(updatedJob.status).label}`);
    } catch (err: any) {
      console.error('❌ Error starting job:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'ไม่สามารถเริ่มงานได้';
      setError(errorMessage);
      alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
    } finally {
      setStarting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'รอรับงาน', className: 'badge-warning' },
      IN_PROGRESS: { label: 'กำลังซ่อม', className: 'badge-info' },
      WAITING_PARTS: { label: 'รออะไหล่', className: 'badge-error' },
      COMPLETED: { label: 'เสร็จแล้ว', className: 'badge-success' },
      PAID: { label: 'ชำระเงินแล้ว', className: 'badge-success' },
      CANCELLED: { label: 'ยกเลิก', className: 'badge-error' },
    };
    return badges[status] || { label: status, className: 'badge-info' };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="alert alert-error">
        {error || 'ไม่พบข้อมูลงาน'}
      </div>
    );
  }

  const statusBadge = getStatusBadge(job.status);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">รายละเอียดงาน</h1>
          <p className="text-gray-600 mt-1">Job No: {job.jobNo}</p>
        </div>
        <span className={`badge ${statusBadge.className} text-lg`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Job Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Motorcycle */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลลูกค้าและรถ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Bike className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-600">รถ:</span>
                  <span className="ml-2 font-medium">
                    {job.motorcycle.licensePlate} - {job.motorcycle.brand} {job.motorcycle.model}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-600">ลูกค้า:</span>
                  <span className="ml-2 font-medium">
                    {job.motorcycle.owner.firstName} {job.motorcycle.owner.lastName}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">เบอร์โทร:</span>
                <span className="ml-2 font-medium">{job.motorcycle.owner.phoneNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">เลขไมล์:</span>
                <span className="ml-2 font-medium">{job.motorcycle.mileage || 0} กม.</span>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดงาน</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">อาการ/ปัญหา:</span>
                <p className="mt-1 font-medium">{job.symptom}</p>
              </div>
              {job.diagnosisNotes && (
                <div>
                  <span className="text-gray-600">การวินิจฉัย:</span>
                  <p className="mt-1">{job.diagnosisNotes}</p>
                </div>
              )}
              {job.fuelLevel !== undefined && (
                <div>
                  <span className="text-gray-600">ระดับน้ำมัน:</span>
                  <span className="ml-2 font-medium">{job.fuelLevel}%</span>
                </div>
              )}
              {job.valuables && (
                <div>
                  <span className="text-gray-600">ของมีค่าในรถ:</span>
                  <p className="mt-1">{job.valuables}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">ประเภทงาน:</span>
                <span className={`ml-2 badge ${job.jobType === 'FAST_TRACK' ? 'badge-error' : 'badge-info'}`}>
                  {job.jobType === 'FAST_TRACK' ? 'งานเร่งด่วน' : 'งานปกติ'}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Checklist</h2>
              {job.status !== 'COMPLETED' && job.status !== 'PAID' && (
                <button
                  onClick={() => setShowAddChecklist(!showAddChecklist)}
                  className="btn btn-primary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มรายการ
                </button>
              )}
            </div>

            {showAddChecklist && (
              <form onSubmit={handleAddChecklistItem} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="form-label text-sm">รายการ</label>
                    <input
                      type="text"
                      value={newItem.itemName}
                      onChange={(e) =>
                        setNewItem({ ...newItem, itemName: e.target.value })
                      }
                      className="form-input text-sm"
                      placeholder="เช่น ไฟหน้า"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label text-sm">สภาพ</label>
                    <select
                      value={newItem.condition}
                      onChange={(e) =>
                        setNewItem({ ...newItem, condition: e.target.value })
                      }
                      className="form-select text-sm"
                      required
                    >
                      <option value="">-- เลือก --</option>
                      <option value="GOOD">ดี</option>
                      <option value="FAIR">พอใช้</option>
                      <option value="POOR">เสีย</option>
                      <option value="NEED_REPAIR">ต้องซ่อม</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="form-label text-sm">หมายเหตุ</label>
                      <input
                        type="text"
                        value={newItem.notes || ''}
                        onChange={(e) =>
                          setNewItem({ ...newItem, notes: e.target.value })
                        }
                        className="form-input text-sm"
                        placeholder="หมายเหตุ (ถ้ามี)"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary text-sm">
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddChecklist(false);
                        setNewItem({ itemName: '', condition: '', notes: '' });
                      }}
                      className="btn btn-outline text-sm"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </form>
            )}

            {checklistItems.length > 0 ? (
              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-orange-500 transition"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.itemName}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        สภาพ: <span className="font-medium">{item.condition}</span>
                        {item.notes && <span className="ml-2">({item.notes})</span>}
                      </div>
                    </div>
                    {job.status !== 'COMPLETED' && job.status !== 'PAID' && (
                      <button
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        className="btn btn-outline btn-error text-sm ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>ยังไม่มีรายการ Checklist</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
            <div className="space-y-2">
              {(job.status === 'PENDING' || job.status === 'WAITING_PARTS') && (
                <button 
                  onClick={handleStartJob}
                  disabled={starting}
                  className="btn btn-primary w-full"
                >
                  {starting ? (
                    <>
                      <div className="spinner mr-2"></div>
                      กำลังเริ่ม...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      เริ่มงาน
                    </>
                  )}
                </button>
              )}
              <Link
                to={`/workshop/requisitions?jobId=${job.id}`}
                className="btn btn-primary w-full"
              >
                <Wrench className="w-4 h-4" />
                ขอเบิกอะไหล่
              </Link>
              <button
                onClick={() => setShowOutsourceModal(true)}
                className="btn btn-outline w-full"
              >
                <Wrench className="w-4 h-4" />
                บันทึก Outsource
              </button>
              {job.status === 'IN_PROGRESS' && (
                <button
                  onClick={async () => {
                    if (!confirm('ต้องการเสร็จสิ้นงานนี้หรือไม่?')) return;
                    try {
                      const updatedJob = await jobsService.completeJob(+id);
                      setJob(updatedJob);
                      alert('✅ งานเสร็จสิ้นแล้ว!');
                    } catch (err: any) {
                      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.message || 'ไม่สามารถเสร็จสิ้นงานได้'}`);
                    }
                  }}
                  className="btn btn-success w-full"
                >
                  <CheckCircle className="w-4 h-4" />
                  เสร็จสิ้นงาน
                </button>
              )}
            </div>
          </div>

          {/* Job Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">ข้อมูลงาน</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">วันที่สร้าง:</span>
                <span className="ml-2 font-medium">
                  {new Date(job.createdAt).toLocaleDateString('th-TH')}
                </span>
              </div>
              {(job as any).reception && (
                <div>
                  <span className="text-gray-600">ผู้รับงาน:</span>
                  <span className="ml-2 font-medium">{(job as any).reception?.name || 'ไม่ระบุ'}</span>
                </div>
              )}
              {(job as any).technician && (
                <div>
                  <span className="text-gray-600">ช่างรับผิดชอบ:</span>
                  <span className="ml-2 font-medium">{(job as any).technician?.name || 'ยังไม่ได้มอบหมาย'}</span>
                </div>
              )}
              {(job as any).startedAt && (
                <div>
                  <span className="text-gray-600">เวลาเริ่มงาน:</span>
                  <span className="ml-2 font-medium">
                    {new Date((job as any).startedAt).toLocaleString('th-TH')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showOutsourceModal && job && (
        <OutsourceModal
          jobId={job.id}
          onClose={() => setShowOutsourceModal(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
