import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Bike, Wrench, Calendar } from 'lucide-react';
import { customersService } from '../../services/api/customers.service';
import type { Customer } from '../../services/api/types';
import { formatMotorcycleName } from '../../utils/motorcycle';
import { motorcyclesService } from '../../services/api/motorcycles.service';
import type { Motorcycle } from '../../services/api/types';

export const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [customerData, motorcyclesData] = await Promise.all([
        customersService.findOne(+id),
        motorcyclesService.findAll(+id),
      ]);
      setCustomer(customerData);
      setMotorcycles(motorcyclesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="alert alert-error">
        {error || 'ไม่พบข้อมูลลูกค้า'}
      </div>
    );
  }

  const customerName = customer.title
    ? `${customer.title} ${customer.firstName} ${customer.lastName}`
    : `${customer.firstName} ${customer.lastName}`;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/reception/customers')}
          className="btn btn-outline"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">ข้อมูลลูกค้า</h1>
      </div>

      {/* Customer Info */}
      <div className="card mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {customer.firstName.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{customerName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">เบอร์โทร:</span>
                <span className="ml-2 font-medium">{customer.phoneNumber}</span>
              </div>
              {customer.address && (
                <div>
                  <span className="text-gray-600">ที่อยู่:</span>
                  <span className="ml-2 font-medium">{customer.address}</span>
                </div>
              )}
              {customer.taxId && (
                <div>
                  <span className="text-gray-600">เลขผู้เสียภาษี:</span>
                  <span className="ml-2 font-medium">{customer.taxId}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">แต้มสะสม:</span>
                <span className="ml-2 font-medium badge badge-info">{customer.points} แต้ม</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motorcycles */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bike className="w-6 h-6" />
            รถที่ลงทะเบียน ({motorcycles.length})
          </h2>
          <Link
            to={`/reception/motorcycles/new?customerId=${customer.id}`}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            เพิ่มรถใหม่
          </Link>
        </div>

        {motorcycles.length > 0 ? (
          <div className="space-y-4">
            {motorcycles.map((moto) => (
              <div
                key={moto.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {moto.licensePlate}
                      </h3>
                      <Link
                        to={`/reception/jobs/new?motorcycleId=${moto.id}`}
                        className="btn btn-primary text-sm"
                      >
                        <Wrench className="w-4 h-4" />
                        เปิดงานซ่อม
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">ยี่ห้อ/รุ่น:</span>
                        <span className="ml-2 font-medium">{formatMotorcycleName(moto.brand, moto.model)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">สี:</span>
                        <span className="ml-2 font-medium">{moto.color}</span>
                      </div>
                      {moto.year && (
                        <div>
                          <span className="text-gray-600">ปี:</span>
                          <span className="ml-2 font-medium">{moto.year}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">เลขไมล์:</span>
                        <span className="ml-2 font-medium">{moto.mileage || 0} กม.</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>VIN: {moto.vin}</span>
                      {moto.engineNo && <span className="ml-4">เลขเครื่อง: {moto.engineNo}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bike className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">ยังไม่มีรถที่ลงทะเบียน</p>
            <Link
              to={`/reception/motorcycles/new?customerId=${customer.id}`}
              className="btn btn-primary inline-block"
            >
              <Plus className="w-5 h-5" />
              เพิ่มรถใหม่
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
