type Props = {
  title: string
  description?: string
  buttonLabel?: string
  onClose: () => void
}

export function AlertModal({
  title,
  description,
  buttonLabel = 'ตกลง',
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 min-w-[320px]" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-5 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-base font-bold text-[#1E1E1E] leading-snug">{title}</p>
          {description && <p className="text-sm text-gray-500 mt-2 leading-relaxed whitespace-pre-line">{description}</p>}
        </div>
        <div className="border-t border-gray-100 flex p-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#F8981D] hover:bg-[#e08518] border-none cursor-pointer transition-colors"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
