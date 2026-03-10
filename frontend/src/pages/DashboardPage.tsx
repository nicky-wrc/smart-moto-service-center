import { useState, useEffect } from 'react';
import { DollarSign, Package, Users, TrendingUp, BarChart3, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reportsService } from '../services/api/reports.service';
import { useAuth } from '../contexts/AuthContext';
import type {
  SalesSummary,
  TopPart,
  TechnicianPerformance,
} from '../services/api/reports.service';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [topParts, setTopParts] = useState<TopPart[]>([]);
  const [technicianPerformance, setTechnicianPerformance] = useState<
    TechnicianPerformance[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is technician
  const isTechnician = user?.role === 'TECHNICIAN';

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Technicians should only see their own performance, not full dashboard
      if (isTechnician) {
        try {
          console.log('🔧 Loading technician performance for user:', user?.id);
          const techs = await reportsService.getTechnicianPerformance({
            technicianId: user?.id,
          });
          console.log('✅ Technician performance data:', techs);
          setTechnicianPerformance(techs || []);
          
          if (!techs || techs.length === 0) {
            console.log('⚠️ No technician performance data found. This is normal if the technician has not completed any jobs yet.');
          }
        } catch (err: any) {
          console.error('❌ Error loading technician performance:', err);
          console.error('❌ Error response:', err.response);
          setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลประสิทธิภาพได้');
          // If API fails, show empty
          setTechnicianPerformance([]);
        }
      } else {
        // Admin/Manager can see full dashboard
        const [summary, parts, techs] = await Promise.all([
          reportsService.getSalesSummary().catch(() => null),
          reportsService.getTopParts({ limit: 10 }).catch(() => []),
          reportsService.getTechnicianPerformance().catch(() => []),
        ]);
        setSalesSummary(summary || null);
        setTopParts(parts || []);
        setTechnicianPerformance(techs || []);
      }
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูล Dashboard ได้');
      // Set default values to prevent crashes
      if (!isTechnician) {
        setSalesSummary({
          totalSales: 0,
          todaySales: 0,
          monthlySales: 0,
          transactionCount: 0,
        });
        setTopParts([]);
      }
      setTechnicianPerformance([]);
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

  // For technicians, show simplified dashboard
  if (isTechnician) {
    const myPerformance = technicianPerformance.find(
      (tech) => tech.technicianId === user?.id,
    );

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">แดชบอร์ดของฉัน</h1>

        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Performance */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              ประสิทธิภาพการทำงาน
            </h2>
            {myPerformance && myPerformance.totalJobs > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">จำนวนงานที่ทำเสร็จ:</span>
                  <span className="font-semibold text-lg">
                    {myPerformance.totalJobs || 0} งาน
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">ค่าแรงรวม:</span>
                  <span className="font-semibold text-lg text-green-600">
                    {(myPerformance.totalCost || 0).toLocaleString()} บาท
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">เวลาเฉลี่ยต่องาน:</span>
                  <span className="font-semibold text-lg">
                    {Number(myPerformance.averageTimePerJob || 0).toFixed(1)} ชม.
                  </span>
                </div>
                {myPerformance.efficiency != null && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">ประสิทธิภาพ:</span>
                    <span className="font-semibold text-lg">
                      {Number(myPerformance.efficiency).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">ยังไม่มีข้อมูลการทำงาน</p>
                <p className="text-sm text-gray-500">
                  ข้อมูลจะแสดงเมื่อคุณทำงานเสร็จสมบูรณ์และมีการบันทึก Labor Time แล้ว
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions for Technician */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              เมนูด่วน
            </h2>
            <div className="space-y-3">
              <a
                href="/workshop/queue"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">ดูคิวงาน</span>
                  <span className="text-blue-600">→</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">ตรวจสอบงานที่รอรับ</p>
              </a>
              <a
                href="/workshop/requisitions"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">ขอเบิกอะไหล่</span>
                  <span className="text-blue-600">→</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">สร้างคำขอเบิกอะไหล่</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">แดชบอร์ด</h1>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">ยอดขายวันนี้</p>
              <p className="text-2xl font-bold text-gray-900">
                {(salesSummary?.todaySales || 0).toLocaleString()} บาท
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">ยอดขายเดือนนี้</p>
              <p className="text-2xl font-bold text-gray-900">
                {(salesSummary?.monthlySales || 0).toLocaleString()} บาท
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">จำนวนรายการ</p>
              <p className="text-2xl font-bold text-gray-900">
                {salesSummary?.transactionCount || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">ยอดขายรวม</p>
              <p className="text-2xl font-bold text-gray-900">
                {(salesSummary?.totalSales || 0).toLocaleString()} บาท
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Parts */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            อะไหล่ขายดี
          </h2>
          {topParts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">ไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {topParts.map((part, index) => (
                <div
                  key={part.partId}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-bold">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{part.partName || 'ไม่ระบุชื่อ'}</p>
                      <p className="text-sm text-gray-600">{part.partNo || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {(part.totalQuantity || 0).toLocaleString()} ชิ้น
                    </p>
                    <p className="text-sm text-gray-600">
                      {(part.totalRevenue || 0).toLocaleString()} บาท
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technician Performance */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ประสิทธิภาพช่าง
          </h2>
          {technicianPerformance.length === 0 ? (
            <p className="text-gray-600 text-center py-8">ไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {technicianPerformance.map((tech) => (
                <div
                  key={tech.technicianId}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{tech.technicianName || 'ไม่ระบุ'}</p>
                    <span className="text-sm text-gray-600">
                      {tech.totalJobs || 0} งาน
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ค่าแรงรวม:</span>
                    <span className="font-medium text-green-600">
                      {(tech.totalCost || 0).toLocaleString()} บาท
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">เวลาเฉลี่ยต่องาน:</span>
                    <span className="text-sm text-gray-600">
                      {Number(tech.averageTimePerJob || 0).toFixed(1)} ชม.
                    </span>
                  </div>
                  {tech.efficiency != null && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">ประสิทธิภาพ:</span>
                      <span className="text-sm text-gray-600">
                        {Number(tech.efficiency).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
