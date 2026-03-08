import { useParams } from "react-router-dom"

function PendingpaymentDetail() {
  const { id } = useParams()

  return (
    <div className="w-full h-full bg-white p-7">
      <h1 className="text-xl font-semibold">รายละเอียดใบงาน #{id}</h1>
    </div>
  )
}

export default PendingpaymentDetail
