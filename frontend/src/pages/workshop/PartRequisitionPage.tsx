import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Save,
  Package,
  Wrench,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { partRequisitionsService } from '../../services/api/part-requisitions.service';
import { partsService } from '../../services/api/parts.service';
import { partPackagesService } from '../../services/api/part-packages.service';
import { jobsService } from '../../services/api/jobs.service';
import type { Part, CreateRequisitionDto, Job, PartPackage } from '../../services/api/types';

export const PartRequisitionPage = () => {
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get('jobId');
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [packages, setPackages] = useState<PartPackage[]>([]);
  const [selectedType, setSelectedType] = useState<'part' | 'package'>('part');
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [requisitionItems, setRequisitionItems] = useState<
    Array<{
      partId?: number;
      packageId?: number;
      quantity: number;
      notes?: string;
      part?: Part;
      package?: PartPackage;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPartsAndPackages();
    if (jobIdParam) {
      loadJob(parseInt(jobIdParam));
    }
  }, [jobIdParam]);

  const loadJob = async (jobId: number) => {
    try {
      const jobData = await jobsService.findOne(jobId);
      setJob(jobData);
    } catch (err: any) {
      console.error('Error loading job:', err);
    }
  };

  const loadPartsAndPackages = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📦 Loading parts and packages...');
      
      // Try to load parts and packages separately to catch individual errors
      let partsData: Part[] = [];
      let packagesData: PartPackage[] = [];
      
      try {
        partsData = await partsService.findAll({ isActive: true });
        console.log('✅ Parts loaded:', partsData.length);
      } catch (err: any) {
        console.error('❌ Error loading parts:', err);
        // Continue even if parts fail - maybe packages will work
      }
      
      try {
        packagesData = await partPackagesService.findAll({ isActive: true });
        console.log('✅ Packages loaded:', packagesData.length);
      } catch (err: any) {
        console.error('❌ Error loading packages:', err);
        // Continue even if packages fail
      }
      
      setParts(partsData || []);
      setPackages(packagesData || []);
      
      if (partsData.length === 0 && packagesData.length === 0) {
        setError('ไม่พบข้อมูลอะไหล่หรือชุดอะไหล่ในระบบ กรุณาติดต่อเจ้าหน้าที่คลัง');
      }
    } catch (err: any) {
      console.error('❌ Error loading parts/packages:', err);
      const errorMsg = err.response?.data?.message || err.message || 'ไม่สามารถโหลดข้อมูลอะไหล่ได้';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (selectedType === 'part' && selectedPartId) {
      const part = parts.find((p) => p.id === selectedPartId);
      if (part) {
        setRequisitionItems([
          ...requisitionItems,
          {
            partId: selectedPartId,
            quantity,
            part,
          },
        ]);
        setSelectedPartId(null);
        setQuantity(1);
      }
    } else if (selectedType === 'package' && selectedPackageId) {
      const package_ = packages.find((p) => p.id === selectedPackageId);
      if (package_) {
        setRequisitionItems([
          ...requisitionItems,
          {
            packageId: selectedPackageId,
            quantity,
            package: package_,
          },
        ]);
        setSelectedPackageId(null);
        setQuantity(1);
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    setRequisitionItems(requisitionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requisitionItems.length === 0) {
      setError('กรุณาเพิ่มอะไหล่หรือชุดอะไหล่อย่างน้อย 1 รายการ');
      return;
    }

    const jobId = jobIdParam ? parseInt(jobIdParam) : undefined;

    setLoading(true);
    setError('');

    try {
      console.log('📦 Creating requisition...', { jobId, items: requisitionItems });
      const dto: CreateRequisitionDto = {
        jobId: jobId ? +jobId : undefined,
        items: requisitionItems.map((item) => ({
          partId: item.partId,
          packageId: item.packageId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      const requisition = await partRequisitionsService.create(dto);
      console.log('✅ Requisition created:', requisition);
      
      const reqNo = (requisition as any).reqNo || 'ไม่ระบุ';
      alert(`✅ สร้างคำขอเบิกอะไหล่สำเร็จ!\n\nเลขที่: ${reqNo}`);
      
      // Redirect back to job detail if jobId exists
      if (jobId) {
        navigate(`/workshop/jobs/${jobId}`);
      } else {
        navigate('/workshop/queue');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างคำขอเบิกได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          to={jobIdParam ? `/workshop/jobs/${jobIdParam}` : '/workshop/queue'}
          className="btn btn-outline"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">ขอเบิกอะไหล่</h1>
          {job && (
            <p className="text-gray-600 mt-1">สำหรับงาน: {job.jobNo}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading && parts.length === 0 && packages.length === 0 ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
        {/* Add Item Section */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">เพิ่มอะไหล่</h2>

          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setSelectedType('part')}
              className={`btn ${selectedType === 'part' ? 'btn-primary' : 'btn-outline'}`}
            >
              <Wrench className="w-5 h-5" />
              อะไหล่
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('package')}
              className={`btn ${selectedType === 'package' ? 'btn-primary' : 'btn-outline'}`}
            >
              <Package className="w-5 h-5" />
              ชุดอะไหล่
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedType === 'part' ? (
              <>
                <div className="form-group">
                  <label className="form-label">เลือกอะไหล่</label>
                  <select
                    value={selectedPartId || ''}
                    onChange={(e) => setSelectedPartId(e.target.value ? +e.target.value : null)}
                    className="form-select"
                  >
                    <option value="">-- เลือกอะไหล่ --</option>
                    {parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.partNo} - {part.name} (สต็อก: {part.stockQuantity} {part.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">จำนวน</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(+e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedPartId}
                    className="btn btn-primary w-full"
                  >
                    <Plus className="w-5 h-5" />
                    เพิ่ม
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">เลือกชุดอะไหล่</label>
                  <select
                    value={selectedPackageId || ''}
                    onChange={(e) => setSelectedPackageId(e.target.value ? +e.target.value : null)}
                    className="form-select"
                  >
                    <option value="">-- เลือกชุดอะไหล่ --</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.packageNo} - {pkg.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">จำนวนชุด</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(+e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedPackageId}
                    className="btn btn-primary w-full"
                  >
                    <Plus className="w-5 h-5" />
                    เพิ่ม
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Requisition Items List */}
        {requisitionItems.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              รายการขอเบิก ({requisitionItems.length})
            </h2>
            <div className="space-y-3">
              {requisitionItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    {item.part ? (
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.part.partNo} - {item.part.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          จำนวน: {item.quantity} {item.part.unit}
                          {item.part.stockQuantity < item.quantity && (
                            <span className="ml-2 text-red-600">
                              (สต็อกไม่พอ: มี {item.part.stockQuantity})
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.package?.packageNo} - {item.package?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          จำนวน: {item.quantity} ชุด
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="btn btn-outline btn-error ml-4"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || requisitionItems.length === 0}
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  ส่งคำขอเบิก
                </>
              )}
            </button>
            <Link
              to={jobIdParam ? `/workshop/jobs/${jobIdParam}` : '/workshop/queue'}
              className="btn btn-outline"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
