import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PaginationBar from "../../components/paginationbar"

const testData = [
  {
    id: "0000001",
    customer: "ธาดา รถ",
    plate: "กข123",
    total: 3500,
    status: "รอชำระ"
  },
  {
    id: "0000002",
    customer: "สมชาย การ์ด",
    plate: "ขค456",
    total: 2100,
    status: "รอชำระ"
  }
  ,
  {
    id: "0000003",
    customer: "สมชาย การ์ด",
    plate: "ขค456",
    total: 2100,
    status: "ชำระแล้ว"
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "รอชำระ":
      return "bg-yellow-400"
    case "ชำระแล้ว":
      return "bg-green-500"
    case "ยกเลิก":
      return "bg-red-500"
    default:
      return "bg-gray-400"
  }
}

function Pendingpayment() {

  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [tableData, setTableData] = useState(testData)
  const [sortBy, setSortBy] = useState("newest")
  const [openSort, setOpenSort] = useState(false)

  const filteredData = testData.filter((item) => {
    return (
      item.id.includes(search) ||
      item.customer.includes(search) ||
      item.plate.includes(search)
    )
  })

  const sortedData = [...filteredData].sort((a, b) => {

    if (sortBy === "newest") {
      return b.id.localeCompare(a.id)
    }

    if (sortBy === "oldest") {
      return a.id.localeCompare(b.id)
    }

    if (sortBy === "price-high") {
      return b.total - a.total
    }

    if (sortBy === "price-low") {
      return a.total - b.total
    }

    return 0
  })



  return (
    <div className="w-full h-full bg-white">
      <div className="px-7 pt-7 pb-1 w-full h-full flex flex-col">
        <div className="w-full h-12  flex items-center justify-between ">

          <div className="w-full h-full flex items-center  rounded-full">
            <button className=" pl-8 pr-4  flex items-center  bg-[#F8981D] h-full rounded-l-full cursor-pointer" >
              <div className=" flex items-center gap-3">

                <div className=" whitespace-nowrap">
                  ค้นหาโดย
                </div>

                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6" strokeWidth={2}>
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

              </div>
            </button>
            <form action="" className="flex items-center justify-start w-full h-[95%] pl-3 pr-6 shadow-[0_0px_2px_rgba(0,0,0,0.4)] rounded-r-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาเลขใบงาน / ลูกค้า / ทะเบียนรถ"
                className="w-full h-[95%]"
              />
            </form>
          </div>

          <div className="h-full ml-5 ">
            <div className="relative h-full">

              <button
                onClick={() => setOpenSort(!openSort)}
                className="rounded-full whitespace-nowrap px-8 flex items-center bg-white h-full shadow-[0_0px_2px_rgba(0,0,0,0.4)] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div>จัดเรียงตาม</div>

                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth={2} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/>
                  </svg>

                </div>
              </button>

              {openSort && (
                <div className="absolute right-0 mt-2 w-42 bg-white rounded-lg shadow-[0_0px_2px_rgba(0,0,0,0.4)]  z-20">

                  <button
                    onClick={() => { setSortBy("newest"); setOpenSort(false) }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    ล่าสุด
                  </button>

                  <button
                    onClick={() => { setSortBy("oldest"); setOpenSort(false) }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    เก่าสุด
                  </button>

                  <button
                    onClick={() => { setSortBy("price-high"); setOpenSort(false) }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    ยอดสูง → ต่ำ
                  </button>

                  <button
                    onClick={() => { setSortBy("price-low"); setOpenSort(false) }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    ยอดต่ำ → สูง
                  </button>

                </div>
              )}

            </div>
          </div>

        </div>

        <div className=" w-full flex-1 mt-6">
          <div className="bg-white overflow-x-auto">
            <table className="min-w-[722px] w-full text-md text-black">

              <thead className="bg-[#F5F5F5] text-black w-full h-full">
                <tr>
                  <th className="px-6 py-5 text-left font-medium rounded-l-2xl">เลขใบงาน</th>
                  <th className="px-6 py-5 text-left font-medium">ชื่อลูกค้า</th>
                  <th className="px-6 py-5 text-left font-medium">ทะเบียนรถ</th>
                  <th className="px-6 py-5 text-left font-medium">ยอดรวม</th>
                  <th className="px-6 py-5 text-center font-medium">สถานะ</th>
                  <th className="px-6 py-5 text-center font-medium rounded-r-2xl">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 border-b border-gray-200">
                {tableData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">

                    <td className="px-6 py-5">{item.id}</td>

                    <td className="px-6 py-5">{item.customer}</td>

                    <td className="px-6 py-5">{item.plate}</td>

                    <td className="px-6 py-5">
                      {item.total.toLocaleString()}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center w-fit mx-auto gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></span>
                        {item.status}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">

                      {item.status === "ชำระแล้ว" ? (

                        <button onClick={() => navigate(`/accountant/pendingpayment/${item.id}`)} className="flex items-center gap-2 bg-[#7eccff] text-white text-xs px-4 py-2 rounded-md mx-auto cursor-pointer">

                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                          </svg>

                          ดูข้อมูล
                        </button>

                      ) : (

                        <button onClick={() => navigate(`/accountant/pendingpayment/${item.id}`)} className="flex items-center gap-2 bg-green-600 text-white text-xs px-4 py-2 rounded-md mx-auto cursor-pointer">

                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4 " strokeWidth={2}>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                          </svg>

                          รับชำระ
                        </button>

                      )}

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
        <div className="w-full h-14">
          <PaginationBar
            data={sortedData}
            onPageData={setTableData}
          />
        </div>

      </div>
    </div>
  )
}
export default Pendingpayment