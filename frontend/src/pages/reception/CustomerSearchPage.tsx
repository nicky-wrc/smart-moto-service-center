import { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { customersService } from '../../services/api/customers.service';
import type { Customer } from '../../services/api/types';

export const CustomerSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await customersService.findAll(searchTerm);
      setCustomers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการค้นหา');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto search เมื่อพิมพ์
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getCustomerName = (customer: Customer) => {
    const title = customer.title ? `${customer.title} ` : '';
    return `${title}${customer.firstName} ${customer.lastName}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ค้นหาลูกค้า</h1>
        <Link to="/reception/customers/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          เพิ่มลูกค้าใหม่
        </Link>
      </div>

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วยชื่อ, เบอร์โทร, หรือทะเบียนรถ..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังค้นหา...</p>
        </div>
      ) : customers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              to={`/reception/customers/${customer.id}`}
              className="card hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                  {customer.firstName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {getCustomerName(customer)}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phoneNumber}</span>
                    </div>
                    {customer.address && (
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 mt-0.5" />
                        <span className="line-clamp-2">{customer.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="badge badge-info">แต้ม: {customer.points}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : searchTerm ? (
        <div className="card text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบลูกค้า</p>
          <Link to="/reception/customers/new" className="btn btn-primary mt-4 inline-block">
            <Plus className="w-5 h-5" />
            เพิ่มลูกค้าใหม่
          </Link>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">กรุณาค้นหาลูกค้า หรือเพิ่มลูกค้าใหม่</p>
        </div>
      )}
    </div>
  );
};
