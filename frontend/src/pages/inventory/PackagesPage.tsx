import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { partPackagesService } from '../../services/api/part-packages.service';
import type { PartPackage, CreatePackageDto } from '../../services/api/types';

export const PackagesPage = () => {
  const [packages, setPackages] = useState<PartPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreatePackageDto>({
    name: '',
    description: '',
    sellingPrice: 0,
    items: [],
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const filters: any = { isActive: true };
      if (searchTerm) filters.search = searchTerm;
      const data = await partPackagesService.findAll(filters);
      setPackages(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadPackages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการชุดอะไหล่</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          สร้างชุดอะไหล่ใหม่
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="ค้นหาชุดอะไหล่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button onClick={handleSearch} className="btn btn-secondary">
            ค้นหา
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
      ) : packages.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบชุดอะไหล่</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {pkg.packageNo}
                  </h3>
                  <p className="text-gray-600">{pkg.name}</p>
                </div>
                <span className={`badge ${pkg.isActive ? 'badge-success' : 'badge-error'}`}>
                  {pkg.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                </span>
              </div>
              {pkg.description && (
                <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
              )}
              <div className="mb-3">
                <span className="text-gray-600">ราคาขาย: </span>
                <span className="font-semibold text-green-600">
                  {pkg.sellingPrice.toLocaleString()} บาท
                </span>
              </div>
              <div className="mb-3">
                <span className="text-gray-600">จำนวนรายการ: </span>
                <span className="font-medium">{pkg.items?.length || 0} รายการ</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn btn-outline flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไข
                </button>
                <button className="btn btn-outline btn-error">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
