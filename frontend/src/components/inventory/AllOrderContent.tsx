import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AllOrderContent.css';

interface OrderItem {
    id: string;
    partNumber: string;
    partName: string;
    requestedQty: number;
    currentStock: number;
}

interface OrderRequest {
    id: string;
    date: string;
    requesterName: string;
    motorcycleModel: string;
    licensePlate: string;
    items: OrderItem[];
}

// --- Mock Data ---
const mockOrders: OrderRequest[] = [
    {
        id: '1',
        date: '24 ตุลาคม 2023, 10:30 น.',
        requesterName: 'สมชาย รักดี (หัวหน้าช่าง)',
        motorcycleModel: 'Honda Wave 110i',
        licensePlate: '1กค 1234 กทม',
        items: [
            { id: '1', partNumber: '15410-MFJ-D01', partName: 'ไส้กรองน้ำมันเครื่อง', requestedQty: 5, currentStock: 12 },
            { id: '2', partNumber: '90304-KGH-901', partName: 'น็อตยึดแคร้ง', requestedQty: 10, currentStock: 50 },
        ]
    },
    {
        id: '2',
        date: '24 ตุลาคม 2023, 14:15 น.',
        requesterName: 'วิเชียร ช่างยนต์ (หัวหน้าช่าง)',
        motorcycleModel: 'Yamaha Finn',
        licensePlate: '2ขร 5678 ชลบุรี',
        items: [
            { id: '3', partNumber: '06455-KRE-K01', partName: 'ผ้าเบรคหน้า', requestedQty: 2, currentStock: 8 },
        ]
    },
    {
        id: '3',
        date: '23 ตุลาคม 2023, 09:00 น.',
        requesterName: 'สมชาย รักดี (หัวหน้าช่าง)',
        motorcycleModel: 'Honda Click 160',
        licensePlate: '9กต 9999 นนทบุรี',
        items: [
            { id: '4', partNumber: '31919-K25-601', partName: 'หัวเทียน', requestedQty: 20, currentStock: 5 },
        ]
    },
    {
        id: '4',
        date: '22 ตุลาคม 2023, 11:45 น.',
        requesterName: 'บุญมี อินทร์ทอง (หัวหน้าช่าง)',
        motorcycleModel: 'Honda PCX 160',
        licensePlate: '5กล 1111 เชียงใหม่',
        items: [
            { id: '5', partNumber: '06455-K84-901', partName: 'ผ้าเบรคหลัง', requestedQty: 4, currentStock: 15 },
            { id: '6', partNumber: '15410-MFJ-D01', partName: 'ไส้กรองน้ำมันเครื่อง', requestedQty: 2, currentStock: 12 },
        ]
    },
    {
        id: '5',
        date: '22 ตุลาคม 2023, 15:20 น.',
        requesterName: 'วิเชียร ช่างยนต์ (หัวหน้าช่าง)',
        motorcycleModel: 'Yamaha XMAX 300',
        licensePlate: '7ขข 7777 กทม',
        items: [
            { id: '7', partNumber: '5YP-E3440-00', partName: 'ไส้กรองน้ำมันเครื่อง', requestedQty: 3, currentStock: 0 },
        ]
    },
    {
        id: '6',
        date: '21 ตุลาคม 2023, 08:30 น.',
        requesterName: 'สมชาย รักดี (หัวหน้าช่าง)',
        motorcycleModel: 'Honda ADV 160',
        licensePlate: '3กม 3333 ภูเก็ต',
        items: [
            { id: '8', partNumber: '23100-K0W-N01', partName: 'สายพาน V-Belt', requestedQty: 1, currentStock: 3 },
            { id: '9', partNumber: '22123-K0W-N00', partName: 'เม็ดตุ้มน้ำหนัก', requestedQty: 6, currentStock: 30 },
        ]
    }
];

export default function AllOrderContent() {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();

    // --- State for Backend Integration ---
    const [orders, setOrders] = useState<OrderRequest[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- Simulated API Fetch ---
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // TODO: Replace with actual API call (e.g., axios.get('/api/orders'))
                // Simulating network delay
                await new Promise(resolve => setTimeout(resolve, 800));
                setOrders(mockOrders);
            } catch (err) {
                setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Determine if we are in detail view based on the URL parameter
    const selectedOrder = orderId ? orders.find(o => o.id === orderId) : null;

    if (isLoading) {
        return (
            <div className="inv-order-list-view" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inv-order-list-view" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: '#ef4444', fontSize: '16px' }}>{error}</p>
                <button className="inv-btn inv-btn-danger" onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>ลองใหม่อีกครั้ง</button>
            </div>
        );
    }

    // --- Detail View ---
    if (selectedOrder) {
        return (
            <div className="inv-order-detail-view">
                <div className="inv-detail-header">
                    <button className="inv-back-btn" onClick={() => navigate('/inventory/all-order')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19L5 12L12 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        ย้อนกลับ
                    </button>
                    <div className="inv-detail-title-row">
                        <h2>รายการคำร้องขอที่ {selectedOrder.id}</h2>
                        <span className="inv-detail-date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            {selectedOrder.date}
                        </span>
                    </div>
                    <div className="inv-detail-meta">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            ผู้ทำเรื่องเบิก : {selectedOrder.requesterName}
                        </span>
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 24" className="text-orange"><path fill="currentColor" d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" /><path fill="currentColor" d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" /></svg>
                            รุ่นรถ : {selectedOrder.motorcycleModel} ({selectedOrder.licensePlate})
                        </span>
                    </div>
                </div>

                <div className="inv-detail-table-container">
                    <table className="inv-table">
                        <thead>
                            <tr>
                                <th>รหัสอะไหล่</th>
                                <th>ชื่ออะไหล่</th>
                                <th className="text-right">จำนวนที่ขอเบิก</th>
                                <th className="text-right">คงเหลือในคลัง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedOrder.items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.partNumber}</td>
                                    <td>{item.partName}</td>
                                    <td className="text-right target-qty">{item.requestedQty}</td>
                                    <td className="text-right stock-qty">{item.currentStock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="inv-detail-actions">
                    <button className="inv-btn inv-btn-danger">ปฏิเสธการเบิก</button>
                    <button className="inv-btn inv-btn-success">อนุมัติการเบิก</button>
                </div>
            </div>
        );
    }

    // --- List View (Master) ---
    return (
        <div className="inv-order-list-view">
            <div className="inv-list-header">
                <div className="inv-search-wrapper">
                    <div className="inv-search-wrapper">
                        <svg className="inv-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                            <path fill="currentColor" d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33l-1.42 1.42l-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
                        </svg>
                        <input type="text" placeholder="ค้นหาใบเบิก..." className="inv-search-input" />
                    </div>
                </div>
            </div>

            <div className="inv-order-grid">
                {orders.map(order => (
                    <div key={order.id} className="inv-order-card" onClick={() => navigate(`/inventory/all-order/${order.id}`)}>
                        <div className="inv-card-header-new">
                            <div className="inv-card-tab">
                                คำขอที่ {order.id}
                            </div>
                            <div className="inv-card-date-new">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                {order.date}
                            </div>
                        </div>
                        <div className="inv-card-body-new">
                            <div className="inv-info-row">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                <span>ผู้ทำเรื่องเบิก : {order.requesterName}</span>
                            </div>
                            <div className="inv-info-row">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 24" className="text-orange"><path fill="currentColor" d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" /><path fill="currentColor" d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" /></svg>
                                <span>รุ่นรถ : {order.motorcycleModel}</span>
                            </div>
                            <div className="inv-info-row">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange"><rect width="18" height="12" x="3" y="6" rx="2"></rect><path d="M7 12h10"></path></svg>
                                <span>ป้ายทะเบียน : {order.licensePlate}</span>
                            </div>
                            <div className="inv-info-row">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>
                                <span>รายการคำขอ : {order.items.length} รายการ ({order.items.reduce((sum, i) => sum + i.requestedQty, 0)} ชิ้น)</span>
                            </div>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        ไม่มีรายการคำร้องขอเบิกอะไหล่
                    </div>
                )}
            </div>
        </div>
    );
}
