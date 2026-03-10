export const Footer = () => {
  return (
    <footer className="bg-[#1e3a5f] text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Smart Moto Service Center</h3>
            <p className="text-sm text-gray-300">
              ระบบบริหารจัดการศูนย์บริการรถจักรยานยนต์ครบวงจร
            </p>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">บริการลูกค้า</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  การรับประกัน
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  การคืนสินค้า
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  ติดต่อเรา
                </a>
              </li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h4 className="font-semibold mb-4">บัญชีของฉัน</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  บัญชีของฉัน
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  ประวัติการซ่อม
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  จดหมายข่าว
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-4">เกี่ยวกับเรา</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  เกี่ยวกับเรา
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  เงื่อนไขการใช้งาน
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  นโยบายความเป็นส่วนตัว
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-700 mt-8 pt-6 text-center text-sm text-gray-300">
          <p>Copyright © 2024 Smart Moto Service Center. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
