import { useNavigate, useParams } from "react-router-dom"

function PaymentHistoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="w-full h-full bg-white p-7">
      <button
        onClick={() => navigate('/accountant/historys')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        ย้อนกลับ
      </button>
      <h1 className="text-xl font-semibold">ประวัติการชำระ #{id}</h1>
    </div>
  )
}

export default PaymentHistoryDetailPage
