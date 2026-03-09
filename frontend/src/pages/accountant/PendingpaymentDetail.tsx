import { useParams } from "react-router-dom"
import { FaCarAlt } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { FaRegFileLines } from "react-icons/fa6";
import { useState } from "react"
import { FaClipboardCheck } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";

function PendingpaymentDetail() {

  const { id } = useParams()
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [openModal, setOpenModal] = useState(false)

  const jobData = {
    jobNo: id,
    customer: {
      name: "ธาดา รัตนพันธ์",
      vehicle: "PCX ทะเบียน 999 กรุงเทพ",
      phone: "081-234-5678"
    },

    parts: [
      {
        name: "ล้อ",
        price: 10000,
        qty: 4
      },
      {
        name: "ผ้าเบรก",
        price: 1500,
        qty: 2
      }
    ]
  }

  const subtotal = jobData.parts.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  )

  const vat = subtotal * 0.07
  const total = subtotal + vat

  return (
    <div className="w-full h-full bg-gray-100 p-7">

      <div className="grid grid-cols-[1fr_700px] gap-4 h-full">

        <div className="grid grid-rows-[auto_1fr] gap-4 h-full">

          <div className="bg-white p-6 rounded-xl shadow flex justify-between flex-col gap-3">
            <div className="flex items-center  border-b pb-4 border-gray-300">
              <div className="w-20 mr-5 h-20 bg-amber-600 rounded-full flex items-center justify-center">
                <p className="text-2xl">{jobData.customer.name.charAt(0)}</p>
              </div>
              <div>
                <p className="font-semibold text-2xl mb-2">
                  {jobData.customer.name}
                </p>

                <div className="flex items-center  justify-center gap-20" >
                  <p className="text-sm text-gray-500  flex  items-center  justify-center gap-3">
                    <FaCarAlt />
                    {jobData.customer.vehicle}
                  </p>

                  <p className="text-sm text-gray-500 flex  items-center  justify-center gap-3">
                    <FaPhone />

                    {jobData.customer.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm  flex  items-center  justify-start gap-3">
              <div className=" flex  items-center  justify-center "><FaRegFileLines /></div>
              <div>Job No. {jobData.jobNo}</div>
            </div>
          </div>


          <div className="bg-white p-6 rounded-xl shadow flex flex-col">

            <h2 className="font-semibold mb-4 text-2xl">ค่าอะไหล่</h2>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F5F5] text-black">
                  <tr>
                    <th className="pl-6 pr-32 py-5 text-left font-medium rounded-l-2xl">รายการ</th>
                    <th className="px-6 py-5 text-left font-medium">ราคาต่อชิ้น</th>
                    <th className="px-6 py-5 text-center font-medium">จำนวน</th>
                    <th className="px-6 py-5 text-right font-medium rounded-r-2xl">รวม</th>
                  </tr>
                </thead>

                <tbody>
                  {jobData.parts.map((item, index) => (
                    <tr key={index} className="border-b border-gray-300">

                      <td className="pl-6 pr-32 py-5 text-left">{item.name}</td>

                      <td className="px-6 py-5 text-left">
                        {item.price.toLocaleString()}
                      </td>

                      <td className="px-6 py-5 text-center">
                        {item.qty}
                      </td>

                      <td className="px-6 py-5 text-right">
                        {(item.price * item.qty).toLocaleString()}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            <div className="mt-6 text-right space-y-1 text-lg flex gap-6 items-center justify-end">
              <div>
                <p>ยอดรวม</p>
                <p>VAT (7%)</p>
                <p>ยอดรวมค่าอะไหล่</p>
              </div>
              <div>
                <p> {subtotal.toLocaleString()}</p>
                <p>  {vat.toLocaleString()}</p>
                <p className="font-semibold">
                  {total.toLocaleString()}
                </p>
              </div>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow flex flex-col gap-6">

          <div className="bg-[#fff5e9] p-6">
            <div>
              <p className="text-gray-500 text-2xl mb-10">ยอดสุทธิ</p>

              <h1 className="text-4xl font-semibold text-center mb-10">
                ฿ {total.toLocaleString()}
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`bg-white flex-1  py-2 rounded-lg ${paymentMethod === "cash"
                  ? "bg-white border  border-orange-400"
                  : ""
                  }`}
              >
                เงินสด
              </button>

              <button
                onClick={() => setPaymentMethod("qr")}
                className={`bg-white flex-1  py-2 rounded-lg ${paymentMethod === "qr"
                  ? "bg-white border  border-orange-400"
                  : ""
                  }`}
              >
                QR Code
              </button>
            </div>
          </div>

          <div className="px-6 flex-1">

            {paymentMethod === "cash" && (
              <>
                <p className="mb-6 text-xl">ชำระด้วยเงินสด</p>

                <div className="space-y-6">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-nowrap w-1/2 h-full p-4 shadow-[0_0px_3px_rgba(0,0,0,0.2)] rounded-l-2xl">
                      รับเงินมา
                    </div>
                    <input
                      type="text"
                      placeholder="รับเงินมา"
                      className="w-1/2  p-4 shadow-[0_0px_3px_rgba(0,0,0,0.2)] rounded-r-2xl"
                    />
                  </div>

                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-nowrap w-1/2 h-full p-4 shadow-[0_0px_3px_rgba(0,0,0,0.2)] rounded-l-2xl">
                      ทอนเงิน
                    </div>
                    <input
                      type="text"
                      placeholder="ทอนเงิน"
                      className="w-1/2  p-4 shadow-[0_0px_3px_rgba(0,0,0,0.2)] rounded-r-2xl"
                    />
                  </div>
                </div>
              </>
            )}

            {/* QR */}
            {paymentMethod === "qr" && (
              <>
                <div className=" w-full h-full flex items-center flex-col justify-between">
                  <p className=" w-full text-start text-xl">ชำระด้วย QR Code</p>

                  <div className="flex justify-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=payment-example"
                      alt="qr"
                    />
                  </div>
                </div>
              </>
            )}

          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-[#F8981D] text-white m-6 p-4 rounded-lg font-semibold "
          >
            ยืนยันการชำระเงิน
          </button>

        </div>

      </div>
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[620px] rounded-xl shadow-lg p-6 ">

            {/* HEADER */}
            <div className="flex items-center gap-3">
              <div className="p-5 bg-green-200 rounded-full flex items-center justify-center">
                <FaClipboardCheck className="text-[#00611D] size-6"/>
              </div>
              <p className="font-semibold text-xl">ชำระเงินสำเร็จ</p>
            </div>

            {/* PREVIEW */}
            <div className="py-6">
              <div className=" min-h-[400px] shadow-[0_0px_3px_rgba(0,0,0,0.3)] rounded-xl flex items-center justify-center text-gray-400">
                Preview <br />
                (แนบ A4 เป็น 2 ช่อง ให้ลูกค้าและสำหรับร้าน)
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 justify-between">

              <button className="bg-[#F8981D] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                <IoPrint size={20}/>
                พิมพ์ใบเสร็จ
              </button>

              <button className="border border-[#F8981D] text-[#F8981D] px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                <FiDownload size={20}/>
                ดาวน์โหลด
              </button>

              <button
                onClick={() => setOpenModal(false)}
                className="border border-[#F8981D] text-[#F8981D] px-8 py-2 rounded-lg flex"
              >
                เสร็จสิ้น
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  )
}

export default PendingpaymentDetail