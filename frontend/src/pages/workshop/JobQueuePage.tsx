import React, { useState, useEffect } from 'react';
import { Wrench, Clock, AlertCircle, CheckCircle, Play, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobsService } from '../../services/api/jobs.service';
import type { Job } from '../../services/api/types';
import { useAuth } from '../../context/AuthContext';
import { formatMotorcycleName } from '../../utils/motorcycle';

export const JobQueuePage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadQueue = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔧 Loading job queue...');
      console.log('👤 User:', user);
      console.log('👤 User role:', user?.role);
      console.log('👤 User id:', user?.id);
      
      // สำหรับ TECHNICIAN: ต้องดูทั้งงานที่ assign ให้ตัวเอง (technicianId = user.id)
      // และงานที่ยังไม่ได้ assign (technicianId = null)
      // แต่ API /jobs/queue ถ้าส่ง technicianId ไปจะ filter เฉพาะงานของ technician นั้น
      // ดังนั้นสำหรับ TECHNICIAN ไม่ส่ง technicianId เพื่อให้เห็นทุกงานที่รอรับ
      // สำหรับ FOREMAN, ADMIN, MANAGER: ไม่ส่ง technicianId เพื่อดูทุกงาน
      const technicianId = undefined; // ไม่ส่งเพื่อให้เห็นทุกงานที่ status เป็น PENDING, IN_PROGRESS, WAITING_PARTS
      console.log('🔧 Technician ID (will not filter by technician):', technicianId);
      console.log('📝 Note: Showing all jobs with status PENDING, IN_PROGRESS, or WAITING_PARTS');
      
      const data = await jobsService.getQueue(technicianId);
      console.log('✅ Jobs loaded:', data);
      console.log('✅ Jobs count:', data?.length || 0);
      console.log('✅ Jobs array:', JSON.stringify(data, null, 2));
      setJobs(data || []);
    } catch (err: any) {
      console.error('❌ Error loading queue:', err);
      console.error('❌ Error response:', err.response);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดคิวงานได้');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'รอรับงาน', className: 'badge-warning' },
      IN_PROGRESS: { label: 'กำลังซ่อม', className: 'badge-info' },
      WAITING_PARTS: { label: 'รออะไหล่', className: 'badge-error' },
      COMPLETED: { label: 'เสร็จแล้ว', className: 'badge-success' },
    };
    return badges[status] || { label: status, className: 'badge-info' };
  };

  const getJobTypeBadge = (jobType: string) => {
    if (jobType === 'FAST_TRACK') {
      return <span className="badge badge-error">⚡ Fast Track</span>;
    }
    return <span className="badge badge-info">ปกติ</span>;
  };

  // Function to handle start job
  const handleStartJob = async (jobId: number) => {
    try {
      console.log('🚀 Starting job:', jobId);
      const updatedJob = await jobsService.startJob(jobId);
      console.log('✅ Job started:', updatedJob);
      
      alert(`เริ่มงานสำเร็จ!\nหมายเลขงาน: ${updatedJob.jobNo}\nสถานะ: ${updatedJob.status}`);
      
      // Reload queue to refresh the list
      await loadQueue();
    } catch (err: any) {
      console.error('❌ Error starting job:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'ไม่สามารถเริ่มงานได้';
      alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
      throw err;
    }
  };

  // แยก Fast Track และ Normal
  const fastTrackJobs = jobs.filter(j => j.jobType === 'FAST_TRACK');
  const normalJobs = jobs.filter(j => j.jobType === 'NORMAL');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">คิวงานซ่อม</h1>
        <button onClick={loadQueue} className="btn btn-secondary" disabled={loading}>
          {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
        </button>
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
      ) : jobs.length === 0 ? (
        <div className="card text-center py-12">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">ไม่มีงานในคิว</p>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto whitespace-pre-line">
            {user?.role === 'TECHNICIAN' 
              ? 'ยังไม่มีงานรอรับในระบบ\n\nงานที่จะแสดงในคิว:\n• งานที่ status เป็น PENDING (รอรับงาน) - รวมงานที่ยังไม่ได้ assign\n• งานที่ status เป็น IN_PROGRESS (กำลังซ่อม)\n• งานที่ status เป็น WAITING_PARTS (รออะไหล่)\n\n💡 คุณสามารถรับงานที่ status เป็น PENDING ได้โดยการคลิกที่งาน' 
              : 'ยังไม่มีงานรอรับในระบบ\n\nงานที่จะแสดงในคิว:\n• งานที่ status เป็น PENDING (รอรับงาน)\n• งานที่ status เป็น IN_PROGRESS (กำลังซ่อม)\n• งานที่ status เป็น WAITING_PARTS (รออะไหล่)\n\n💡 หมายเหตุ: งานที่ status เป็น COMPLETED, PAID, หรือ CANCELLED จะไม่แสดงในคิว'}
          </p>
          <button onClick={loadQueue} className="btn btn-secondary">
            รีเฟรช
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-12">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 font-medium">ไม่มีงานในคิว</p>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto whitespace-pre-line">
            {user?.role === 'TECHNICIAN' 
              ? 'ไม่มีงานที่มอบหมายให้คุณ หรือยังไม่มีงานรอรับในระบบ\n(งานที่ status เป็น PENDING, IN_PROGRESS, หรือ WAITING_PARTS)' 
              : 'ยังไม่มีงานรอรับในระบบ\n(งานที่ status เป็น PENDING, IN_PROGRESS, หรือ WAITING_PARTS)\n\n💡 หมายเหตุ: งานที่ status เป็น COMPLETED, PAID, หรือ CANCELLED จะไม่แสดงในคิว'}
          </p>
          <button onClick={loadQueue} className="btn btn-secondary">
            รีเฟรช
          </button>
        </div>
      ) : (
        <>
          {/* Fast Track Jobs */}
          {fastTrackJobs.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">งานเร่งด่วน (Fast Track)</h2>
                <span className="badge badge-error">{fastTrackJobs.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fastTrackJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    getStatusBadge={getStatusBadge} 
                    getJobTypeBadge={getJobTypeBadge}
                    onStartJob={handleStartJob}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Normal Jobs */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">งานปกติ</h2>
              <span className="badge badge-info">{normalJobs.length}</span>
            </div>
            {normalJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {normalJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    getStatusBadge={getStatusBadge} 
                    getJobTypeBadge={getJobTypeBadge}
                    onStartJob={handleStartJob}
                  />
                ))}
              </div>
            ) : fastTrackJobs.length > 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-600">ไม่มีงานปกติในคิว</p>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

interface JobCardProps {
  job: Job;
  getStatusBadge: (status: string) => { label: string; className: string };
  getJobTypeBadge: (jobType: string) => React.ReactNode;
  onStartJob?: (jobId: number) => Promise<void>;
}

const JobCard = ({ job, getStatusBadge, getJobTypeBadge, onStartJob }: JobCardProps) => {
  const statusBadge = getStatusBadge(job.status);
  const [starting, setStarting] = useState(false);

  const handleStartJob = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onStartJob) return;
    if (job.status !== 'PENDING' && job.status !== 'WAITING_PARTS') {
      alert('สามารถเริ่มงานได้เฉพาะงานที่ status เป็น PENDING หรือ WAITING_PARTS เท่านั้น');
      return;
    }

    if (!confirm(`ต้องการเริ่มงาน ${job.jobNo} หรือไม่?`)) {
      return;
    }

    setStarting(true);
    try {
      await onStartJob(job.id);
    } catch (err) {
      console.error('Error starting job:', err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <Link
      to={`/workshop/jobs/${job.id}`}
      className="card hover:shadow-lg transition cursor-pointer border-l-4 border-l-blue-500"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-lg text-gray-900 mb-1">{job.jobNo}</div>
          <div className="flex items-center gap-2 mb-2">
            {getJobTypeBadge(job.jobType)}
            <span className={`badge ${statusBadge.className}`}>{statusBadge.label}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">รถ:</span>
          <span className="ml-2 font-medium">{job.motorcycle.licensePlate}</span>
        </div>
        <div>
          <span className="text-gray-600">{formatMotorcycleName(job.motorcycle.brand, job.motorcycle.model)}</span>
        </div>
        <div>
          <span className="text-gray-600">ลูกค้า:</span>
          <span className="ml-2 font-medium">{job.motorcycle.owner.firstName} {job.motorcycle.owner.lastName}</span>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <span className="text-gray-600">อาการ:</span>
          <p className="mt-1 text-gray-900 line-clamp-2">{job.symptom}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{new Date(job.createdAt).toLocaleDateString('th-TH')}</span>
        </div>
        {(job.status === 'PENDING' || job.status === 'WAITING_PARTS') && (
          <button
            onClick={handleStartJob}
            disabled={starting}
            className="btn btn-primary text-sm"
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
        {job.status === 'IN_PROGRESS' && (
          <Link
            to={`/workshop/jobs/${job.id}`}
            className="btn btn-info text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            ดูรายละเอียด
          </Link>
        )}
      </div>
    </Link>
  );
};
