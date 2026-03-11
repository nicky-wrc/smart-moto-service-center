import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Moto</h1>
          <p className="text-gray-600">Service Center Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            เข้าสู่ระบบ
          </h2>

          {error && (
            <div className="alert alert-error mb-4">
              <AlertCircle className="w-5 h-5 inline mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                ชื่อผู้ใช้
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="กรอกชื่อผู้ใช้"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="กรอกรหัสผ่าน"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 border-2 border-white border-t-transparent"></div>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>

          {/* Test Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">บัญชีทดสอบ:</p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>admin</span>
                <span className="badge badge-info">ADMIN</span>
              </div>
              <div className="flex justify-between">
                <span>sa1</span>
                <span className="badge badge-success">SERVICE_ADVISOR</span>
              </div>
              <div className="flex justify-between">
                <span>tech1</span>
                <span className="badge badge-warning">TECHNICIAN</span>
              </div>
              <p className="text-center text-gray-400 mt-2">รหัสผ่าน: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
