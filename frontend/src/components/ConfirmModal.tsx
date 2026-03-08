type Props = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-5">
          <p className="text-base font-bold text-[#1E1E1E] leading-snug">{title}</p>
          {description && <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{description}</p>}
        </div>
        <div className="flex border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-sm text-gray-400 hover:text-gray-600 bg-transparent border-none border-r border-gray-100 cursor-pointer transition-colors font-medium"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 text-sm font-semibold text-white bg-[#44403C] hover:bg-black border-none cursor-pointer transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
