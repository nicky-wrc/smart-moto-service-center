import PaginationBar from "../../components/paginationbar"

function Pendingpayment() {
  return (
    <div className="p-7 w-full h-full flex flex-col">
      <div className="w-full h-12  flex items-center justify-between ">

        <div className="w-full h-full flex items-center  rounded-full">
          <button className=" px-8 flex items-center justify-between bg-[#F8981D] h-full rounded-l-full" >
            <div className=" flex items-center justify-between">

              <div className=" whitespace-nowrap">
              <p>ค้นหาโดย</p>
              </div>

              <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6" strokeWidth={2}>
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>

            </div>
          </button>
          <form action="" className="flex items-center justify-start w-full h-[95%] pl-3 pr-6 shadow-[0_0px_2px_rgba(0,0,0,0.4)] rounded-r-full">
            <input type="text" className="w-full h-[95%]" />
          </form>
        </div>

        <div className="h-full ml-5 ">
          <button className="rounded-full whitespace-nowrap px-10 flex items-center bg-white h-full shadow-[0_0px_2px_rgba(0,0,0,0.4)] "  >
            จัดเรียงตาม
          </button>
        </div>

      </div>

      <div className="bg-amber-300 w-full flex-1">
      </div>
      <div className="w-full h-14">
        <PaginationBar />
      </div>

    </div>
  )
}
export default Pendingpayment