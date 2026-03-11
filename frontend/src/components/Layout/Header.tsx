import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      ADMIN: 'ผู้ดูแลระบบ',
      SERVICE_ADVISOR: 'พนักงานรับรถ',
      TECHNICIAN: 'ช่าง',
      FOREMAN: 'หัวหน้าช่าง',
      STOCK_KEEPER: 'เจ้าหน้าที่คลัง',
      CASHIER: 'การเงิน',
      MANAGER: 'ผู้จัดการ',
    };
    return roleNames[role] || role;
  };

  return (
    <header className="bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">SMART MOTO</div>
                <div className="text-xs text-gray-500">Service Center</div>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="text-left hidden md:block">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{getRoleName(user.role)}</div>
                      </div>
                      <Menu className="w-5 h-5 text-gray-500" />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowMenu(false)}
                        >
                          <User className="w-4 h-4 inline mr-2" />
                          โปรไฟล์
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 inline mr-2" />
                          ออกจากระบบ
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  <User className="w-4 h-4" />
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      {user && (
        <nav className="bg-[#1e3a5f] text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className="px-4 py-3 hover:bg-blue-700 transition font-medium"
              >
                หน้าแรก
              </Link>
              {(user.role === 'SERVICE_ADVISOR' || user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <Link
                  to="/reception"
                  className="px-4 py-3 hover:bg-blue-700 transition font-medium"
                >
                  รับรถ / SA
                </Link>
              )}
              {(user.role === 'TECHNICIAN' || user.role === 'FOREMAN' || user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <Link
                  to="/workshop"
                  className="px-4 py-3 hover:bg-blue-700 transition font-medium"
                >
                  งานช่าง
                </Link>
              )}
              {(user.role === 'STOCK_KEEPER' || user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <Link
                  to="/inventory"
                  className="px-4 py-3 hover:bg-blue-700 transition font-medium"
                >
                  คลังอะไหล่
                </Link>
              )}
              {(user.role === 'CASHIER' || user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <Link
                  to="/billing"
                  className="px-4 py-3 hover:bg-blue-700 transition font-medium"
                >
                  การเงิน / CRM
                </Link>
              )}
              {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <Link
                  to="/admin"
                  className="px-4 py-3 hover:bg-blue-700 transition font-medium"
                >
                  จัดการระบบ
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};
