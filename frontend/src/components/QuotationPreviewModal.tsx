import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  onClose: () => void
  onConfirm: () => void
  confirmLabel: string
  confirmDisabled?: boolean
  children: ReactNode
}

export function QuotationPreviewModal({ title, subtitle, onClose, onConfirm, confirmLabel, confirmDisabled, children }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#F8981D] uppercase tracking-widest mb-0.5">RevUp</p>
              <h2 className="text-base font-bold text-[#1E1E1E]">{title}</h2>
              {subtitle && <p className="text-sm text-amber-600 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 bg-transparent border-none cursor-pointer text-xl leading-none">✕</button>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col gap-3">
          {children}
        </div>

        <div className="flex border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 text-sm text-gray-400 hover:text-gray-600 bg-transparent border-none border-r border-gray-100 cursor-pointer transition-colors font-medium">ยกเลิก</button>
          <button onClick={onConfirm} disabled={confirmDisabled} className="flex-1 py-4 text-sm font-semibold text-white bg-[#44403C] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer transition-colors rounded-br-2xl">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
